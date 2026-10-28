# OliviaRossi/SenseNova-6.8-Code2Video-GSQ-RCO-GGUF

## Resumen

`OliviaRossi/SenseNova-6.8-Code2Video-GSQ-RCO-GGUF` es una cuantización GGUF de precisión mixta no uniforme del modelo `sensenova/SenseNova-6.8-Code2Video`, publicada por un tercero (usuario OliviaRossi) y no por el equipo de SenseNova. El artefacto empaqueta los 26.895.998.464 parámetros reales del modelo base (≈26,9B, pese al «6.8» del nombre) en un único fichero de unos 10,2 GB, lo que permite ejecutarlo con llama.cpp en hardware de consumo. La técnica empleada, GSQ + RCO (Riemannian Constrained Optimization), asigna un tipo de cuantización distinto a cada tensor en lugar de aplicar uno uniforme a toda la red.

El interés de esta ficha es doble: por un lado, documenta una forma relativamente nueva de cuantización por tensor que está apareciendo en el ecosistema GGUF; por otro, sirve como caso de estudio de los riesgos de las cuantizaciones no oficiales, ya que el mapa de asignación de tensores y la importance matrix utilizados provienen de un modelo distinto (Qwen3.8-27B), no del modelo objetivo. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y su model card es exclusivamente una tarjeta de cuantización: no aporta información sobre entrenamiento, idiomas, contexto nativo ni evaluación de calidad.

La relevancia práctica es limitada pero concreta: si el modelo base funciona para tu caso de uso, este GGUF es la vía más barata (en VRAM) para probarlo en local, a costa de una pérdida de precisión agresiva en las capas feed-forward y de una validación empírica pendiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas SSM (según repos de terceros, «hybrid qwen35 architecture»; no confirmado en la model card de este repo) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | No disponible (no se describe como MoE en la información proporcionada) |
| Longitud de contexto | No disponible (el ejemplo de servido de la model card usa `-c 32768`, pero es un parámetro de llama-server, no el contexto de entrenamiento) |
| Tipos de cuantizacion | GGUF mixta no uniforme, perfil `GSQ-RCO-IQ3_XXS`: `IQ4_XS`/`Q5_K`/`Q6_K` en proyecciones de atención (`attn_qkv`, `attn_gate`), `IQ2_S`/`IQ2_XXS` en `ffn_down`/`ffn_up`, `BF16`/`F32` en capas SSM y normalización |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (declarada en este repo de cuantización; la licencia del modelo base no se detalla en la información disponible) |
| Formato de pesos | GGUF (llama.cpp), fichero único de ≈10,2 GB; el repo no incluye proyector multimodal ni cabeza MTP |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base: no hay número de tokens, composición del dataset, ni mención a RLHF, DPO o fases de post-entrenamiento. Lo único inferible es la arquitectura, y de forma indirecta: repositorios de terceros sobre el mismo modelo base lo describen como «27B hybrid qwen35 architecture», y la propia model card de esta cuantización menciona capas SSM preservadas en BF16/F32 junto a proyecciones de atención convencionales. Eso apunta a un diseño híbrido que combina atención con capas de espacio de estados (del estilo Mamba o atención lineal), lo que explicaría la sensibilidad numérica de esas capas y su conservación en alta precisión.

La innovación técnica relevante aquí no está en el modelo, sino en el método de cuantización. GSQ-RCO asigna tipos de cuantización por tensor resolviendo un problema de optimización con restricciones riemannianas: las proyecciones de atención se mantienen en `IQ4_XS`–`Q6_K` para preservar recuperación y razonamiento, las capas feed-forward se comprimen hasta `IQ2_XXS`/`IQ2_S` aprovechando su redundancia, y SSM y normalización quedan en coma flotante. Es un enfoque cualitativamente distinto de las recetas escalares tipo Q4_K_M, pero con dos caveats importantes documentados en la propia card: el mapa de asignación de tensores se deriva de `ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF` y la importance matrix es `imatrix-qwen3.8-27b.gguf`, es decir, ambos provienen de otra familia de modelos, no de `SenseNova-6.8-Code2Video`.

## Capacidades

- Generación de texto y razonamiento general: capacidad esperable de un modelo de ~27B, sin evaluación publicada en la información disponible.
- Orientación a código: el nombre del modelo (`Code2Video`) y su etiqueta `code2video` sugieren un uso principal de generación de código para producir vídeo (por ejemplo, animaciones programáticas), aunque la model card de esta cuantización no lo documenta ni lo verifica.
- Multimodalidad: repos de terceros sobre el mismo modelo base incluyen un proyector de visión F16 (`mmproj-F16.gguf`), lo que indica que el modelo base es multimodal; este repo GGUF no incluye ese proyector ni lo menciona.
- Decodificación especulativa: repos de terceros preservan una cabeza MTP (Multi-Token Prediction, `blk.64`/NextN) en Q8_0; este repo no la incluye, por lo que la decodificación especulativa no está disponible aquí.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Prueba local de bajo coste del modelo base: cargar el GGUF con `llama-cli` o `llama-server -ngl 99` permite evaluar el comportamiento de un modelo de ~27B en una GPU de 24 GB antes de comprometerse con los ≈54 GB en BF16 del repo oficial.
- Generación de código para animación y vídeo programático: si se confirma la orientación `code2video`, el modelo encajaría en pipelines que convierten una descripción en un script (Manim, Processing, SVG animado) que luego se renderiza con ffmpeg; conviene validar la calidad real, ya que las capas FFN están en IQ2.
- Prototipado de asistentes de código en local: integración vía endpoint compatible con OpenAI (`llama-server --port 8080`) para autocompletado y refactorización sin enviar código a la nube, con la advertencia de que la cuantización agresiva puede degradar la fidelidad sintáctica.
- Exploración de arquitecturas híbridas SSM + atención: útil en investigación para observar cómo se comporta un modelo híbrido cuantizado a ~3 bits en tareas de contexto largo frente a un transformer denso equivalente.
- Evaluación comparativa de métodos de cuantización: este repo sirve como punto de comparación directo frente a las cuantizaciones GGUF convencionales del mismo modelo base publicadas por terceros, midiendo la degradación atribuible a GSQ-RCO.
- Despliegue en entornos sin GPU: con 10,2 GB de pesos, el modelo cabe en RAM de un portátil de 16 GB y puede ejecutarse en CPU con llama.cpp, a costa de una latencia alta y del coste de descompresión de los tensores IQ2.
- Generación de guiones técnicos y documentación de vídeo: uso genérico de generación de texto con contexto medio, adecuado para redactar guiones, descripciones y storyboards a partir de código o especificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantización no incluye MMLU, HumanEval, GSM8K ni ninguna métrica de perplejidad o de degradación respecto al modelo base, y tampoco se han encontrado en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM para pesos: ≈10,2 GB (tamaño real del fichero GGUF). Estimación a partir del tamaño del repo, no de medición propia.
- VRAM total recomendada: 16 GB para offload completo con contexto moderado; 24 GB (RTX 3090/4090, A10G, L4 con menos holgura) para offload completo con contexto largo y KV cache amplia. Los ejemplos de la card usan `-c 32768`, lo que añade varios GB de caché según la arquitectura híbrida.
- GPU de 12 GB (RTX 3060 12GB, RTX 4070): no cabe entero; requiere offload parcial con `-ngl` y reducción de contexto.
- Cabe en GPU de consumo: sí, en 16–24 GB con offload completo; en 12 GB, parcialmente.
- CPU: viable con 16 GB de RAM o más; los tensores IQ2 requieren descompresión en tiempo de ejecución, lo que reduce el throughput frente a Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato cualquier frontend basado en llama.cpp; no se ha verificado funcionamiento en vLLM ni en TGI con este fichero.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (OliviaRossi, GSQ-RCO-IQ3_XXS) | 26,9B | No disponible | GGUF mixta IQ3_XXS, ≈10,2 GB | apache-2.0 | 0 descargas, 1 like; sin validación comunitaria |
| `sensenova/SenseNova-6.8-Code2Video` (base) | 26,9B | No disponible | Safetensors (BF16) | No disponible en la información recogida | Repo oficial del autor del modelo |
| `Abiray/SenseNova-6.8-Code2Video-GGUF` | 26,9B | No disponible | GGUF + `mmproj-F16.gguf` + cabeza MTP en Q8_0 | No disponible | Repo de terceros con soporte multimodal y decodificación especulativa |
| `ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF` | 27B | No disponible | GGUF GSQ-RCO mixta | No disponible | Origen de la metodología y del mapa de tensores usado aquí |

Diferencias relevantes: frente al repo de Abiray, esta cuantización no incluye proyector de visión ni cabeza MTP, por lo que pierde capacidades multimodales y de decodificación especulativa; a cambio ofrece un fichero único más simple de desplegar. Frente al modelo base, sacrifica aproximadamente tres cuartas partes del tamaño en disco a cambio de una pérdida de precisión no cuantificada públicamente.

## Limitaciones y advertencias

- Cuantización no oficial: publicada por un tercero, no por SenseNova; el modelo base puede tener una licencia o condiciones distintas de la apache-2.0 declarada aquí, que conviene verificar en su repositorio original antes de un uso comercial.
- Importance matrix y mapa de asignación de tensores procedentes de Qwen3.8-27B: al no haberse calculado sobre el modelo objetivo, la asignación de precisión por tensor puede no reflejar la sensibilidad real de las capas de `SenseNova-6.8-Code2Video`, especialmente en las capas SSM de la arquitectura híbrida.
- Capas feed-forward en `IQ2_XXS`/`IQ2_S`: es una compresión muy agresiva (≈2 bits) que típicamente degrada tareas de fidelidad alta como generación de código, matemáticas y seguir instrucciones largas. No hay medición publicada de esa degradación.
- Nombre engañoso: el identificador «6.8» no corresponde al tamaño real (26,9B), lo que puede inducir a error al planificar hardware.
- Sin datos de benchmarks, idiomas, contexto de entrenamiento ni evaluación humana: no es posible estimar su calidad frente al modelo base o frente a otras cuantizaciones.
- Riesgo de alucinación: no cuantificado en la información disponible; en un modelo de ~27B cuantizado a 3 bits es esperable un aumento respecto al BF16.
- Repositorio sin tracción: 0 descargas y 1 like en la fecha de creación, sin issues ni discusión pública que permitan detectar problemas de carga o de calidad.
- Ausencia de proyector multimodal y de cabeza MTP: si el caso de uso requiere visión o decodificación especulativa, este repo no las ofrece; hay que recurrir a las variantes de Abiray.
- El contexto real de entrenamiento no está documentado; usar `-c 32768` no garantiza que el modelo haya sido entrenado para esa ventana.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/OliviaRossi/SenseNova-6.8-Code2Video-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Cuantizaciones GGUF de terceros con proyector de visión F16 y cabeza MTP (Abiray): https://huggingface.co/Abiray/SenseNova-6.8-Code2Video-GGUF
- Variante MTP de Abiray: https://huggingface.co/Abiray/SenseNova-6.8-Code2Video-MTP-GGUF
- Origen de la metodología GSQ-RCO y del mapa de tensores: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio GSQ-RCO de ISTA-DASLab para coder: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Artículo sobre SenseNova-U1-8B GGUF en ComfyUI (contexto del ecosistema SenseNova, no de este modelo): https://hackernoon.com/sensenova-u1-8b-gguf-run-multimodal-ai-on-8gb-vram
