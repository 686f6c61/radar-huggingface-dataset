# marijuanabbi/test_aci_medsynth

## Resumen

`marijuanabbi/test_aci_medsynth` es un ajuste fino (fine-tune) del modelo `unsloth/llama-3-8b-instruct-bnb-4bit`, que a su vez deriva de Meta Llama 3 8B Instruct. Lo publica el usuario marijuanabbi en HuggingFace con licencia declarada Apache 2.0 y fecha de creación declarada el 16 de septiembre de 2026. El nombre del repositorio sugiere un ajuste orientado a la generación de datos médicos sintéticos ("medsynth"), pero la model card no documenta el conjunto de datos, el procedimiento ni el objetivo del entrenamiento.

El repositorio ocupa 0,2 GB, un tamaño muy inferior al de un modelo de 8 000 millones de parámetros en 4 bits (que rondaría los 4,5-5 GB). Esto apunta a que contiene exclusivamente los pesos del adaptador (LoRA/QLoRA) o a una subida incompleta, extremo que no se aclara en la documentación. El entrenamiento se realizó con Unsloth y TRL, según los tags y el propio README.

Se trata de un artefacto experimental sin descargas ni valoraciones, sin evaluación publicada y sin model card descriptiva. No es un modelo listo para producción: cualquier uso requiere verificar primero el contenido real del repositorio, reconstruir la configuración de inferencia y evaluar el comportamiento resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3 8B Instruct) |
| Parametros totales | 8 030 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | Modelo base en bnb-4bit (NF4); el repo contiene safetensors. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 (declarada por el autor; ver advertencias sobre el modelo base) |
| Formato de pesos | safetensors |
| Modelo base | unsloth/llama-3-8b-instruct-bnb-4bit |
| Tamaño del repositorio | 0,2 GB |
| Librería | transformers |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creación (declarada) | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con 32 capas, dimensión oculta de 4096, 32 cabezas de atención y 8 cabezas KV (Grouped-Query Attention), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE) con una base de 500 000. El vocabulario del tokenizador es de 128 256 entradas. El modelo base fue entrenado por Meta sobre más de 15 billones de tokens y posteriormente alineado mediante ajuste supervisado y optimización por preferencias. Ninguno de estos detalles se documenta en la model card del fine-tune; se heredan del modelo base.

El ajuste fino se realizó con Unsloth (que declara un entrenamiento hasta 2 veces más rápido y con menor uso de memoria) y con TRL, según los tags del repositorio. La model card no indica el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rango, alpha, módulos objetivo), la tasa de aprendizaje ni si hubo mezcla con datos generales para mitigar el olvido catastrófico. Tampoco se especifica si los pesos publicados son un adaptador sin fusionar o un modelo ya fusionado.

## Capacidades

Las capacidades listadas a continuación corresponden a las del modelo base Llama 3 8B Instruct. El ajuste fino puede haberlas alterado (mejorado o degradado) en cualquier dirección, y no existe evaluación publicada que lo verifique.

- Generación de texto en inglés con registro conversacional e instruccional.
- Razonamiento de propósito general y resolución de problemas de complejidad media.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, C++, etc.).
- Aritmética y problemas matemáticos de nivel escolar y universitario básico.
- Soporte nativo de tool calling y function calling mediante tokens especiales de la familia Llama 3.
- Encadenamiento multi-paso y uso en flujos de agente con llamadas a herramientas.
- Comprensión lectora y resumen de documentos que quepan en la ventana de contexto.
- Multilingüismo limitado en el modelo base; la model card solo declara inglés como idioma soportado.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Generación de datos clínicos sintéticos: el nombre del repositorio sugiere este propósito; podría emplearse para producir notas clínicas o historiales ficticios con fines de aumento de datos, siempre que se valide previamente la calidad y la ausencia de fuga de datos reales.
- Prototipado de asistentes de documentación médica: borradores de resúmenes de consulta o codificación de diagnósticos en entornos de investigación, nunca en decisiones clínicas.
- Anonimización asistida y reescritura de textos clínicos: reformulación de informes para eliminar identificadores directos antes de compartir un corpus.
- Ajuste adicional sobre dominios especializados (por ejemplo, terminología radiológica o farmacológica), usando este modelo como punto de partida con LoRA.
- Extracción estructurada de información: convertir texto libre en campos JSON mediante tool calling, aprovechando el soporte de function calling heredado.
- Evaluación comparativa de pipelines de fine-tuning: sirve como caso de estudio de un flujo Unsloth + TRL de extremo a extremo, incluida la subida a HuggingFace.
- Chatbot de propósito general en inglés: dado que la model card no documenta especialización real, su uso más seguro es como modelo conversacional genérico de 8B, tras verificar que el ajuste no ha degradado las capacidades base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluación, ni métricas de pérdida durante el entrenamiento, ni comparaciones con el modelo base. Los resultados de búsqueda web asociados no contienen información técnica relevante sobre el modelo (únicamente enlaces al traductor de Google).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16 GB de pesos más memoria para el contexto y el runtime, lo que exige del orden de 20-24 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-11 GB.
- VRAM estimada en cuantización de 4 bits (NF4): aproximadamente 5-7 GB para los pesos, más la caché KV.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090. En 4 bits cabe con holgura en cualquier GPU con 8 GB o más; en FP16 requiere una RTX 4090 o superior.
- GPU de centro de datos: A100 40/80 GB, H100, L40S, A10G.
- Almacenamiento: el repositorio ocupa 0,2 GB, pero si solo contiene un adaptador hay que descargar además el modelo base en 4 bits (unos 4,5-5 GB).
- Opciones de despliegue: transformers; vLLM; TGI (el repositorio está etiquetado como `text-generation-inference`); llama.cpp y Ollama mediante conversión a GGUF, que hay que generar manualmente; Unsloth para entrenamiento y fusión de adaptadores.
- Si el repositorio contiene un adaptador LoRA, será necesario fusionarlo con el modelo base antes de servirlo con vLLM o TGI, o bien cargarlo con PEFT desde transformers.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| test_aci_medsynth (este modelo) | 8 030 M (base) | 8192 tokens | Apache 2.0 declarada (base bajo licencia de Meta) | Repositorio de 0,2 GB, sin evaluaciones; documentación mínima |
| Llama 3 8B Instruct (modelo base) | 8 030 M | 8192 tokens | Meta Llama 3 Community License | Ampliamente disponible; ecosistema maduro de cuantizaciones |
| Mistral 7B Instruct v0.3 | 7 250 M | 32 768 tokens | Apache 2.0 | Muy extendido; soporte nativo en vLLM, llama.cpp y Ollama |
| Qwen2.5 7B Instruct | 7 620 M | 131 072 tokens (con extensión) | Apache 2.0 | Amplia disponibilidad y buen soporte multilingüe |
| Gemma 2 9B Instruct | 9 240 M | 8192 tokens | Gemma Terms of Use | Disponible en HuggingFace y en Ollama; licencia con restricciones de uso |

No se dispone de datos de rendimiento comparativos para este fine-tune, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni curvas de pérdida, ni comparación con el modelo base. No se puede afirmar que el ajuste haya mejorado nada.
- Documentación insuficiente: la model card es una plantilla autogenerada por Unsloth. No indica dataset, hiperparámetros, configuración de LoRA ni objetivo del entrenamiento.
- Discrepancia de licencia: el autor declara Apache 2.0, pero el modelo base Llama 3 8B Instruct está sujeto a la Meta Llama 3 Community License, que impone condiciones adicionales (atribución, política de uso aceptable, obligaciones de nomenclatura). La licencia declarada puede no ser válida para uso comercial sin revisión legal.
- Tamaño anómalo del repositorio: 0,2 GB es coherente con un adaptador, no con un modelo completo. Si es un adaptador sin fusionar, no funcionará con herramientas que esperen safetensors completos.
- Riesgo elevado de alucinación en dominio médico: incluso si el ajuste fue sobre datos médicos sintéticos, no hay garantía de factualidad. No debe usarse para diagnóstico, prescripción ni consejo clínico.
- Olvido catastrófico potencial: un ajuste fino de dominio estrecho sobre un modelo de 8B puede degradar las capacidades generales, el tool calling y el seguimiento de instrucciones. No se ha medido este efecto.
- Idiomas: solo se declara inglés. No hay evidencia de capacidad en castellano ni en otros idiomas tras el ajuste.
- Ventana de contexto limitada a 8192 tokens, inferior a la de alternativas actuales como Mistral 7B Instruct v0.3 (32k) o Qwen2.5 7B (hasta 131k).
- Datos sintéticos: si el entrenamiento usó datos generados artificialmente, existe riesgo de amplificar errores y sesgos presentes en el modelo generador, además de una posible pérdida de diversidad.
- Sin adopción comunitaria: cero descargas y cero valoraciones. No hay reportes independientes que permitan confirmar o desmentir su comportamiento.
- Fecha de creación declarada (16 de septiembre de 2026) posterior a la actual, lo que indica metadatos poco fiables o generados automáticamente.
- El nombre del repositorio incluye "test", lo que refuerza la hipótesis de que se trata de una prueba de flujo de trabajo más que de un modelo destinado a uso real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/marijuanabbi/test_aci_medsynth
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-instruct-bnb-4bit
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Modelo original de Meta: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Paper de Llama 3: https://arxiv.org/abs/2407.21783
- Resultados de búsqueda web: no contenían enlaces técnicos relevantes sobre este modelo (únicamente páginas del traductor de Google).
