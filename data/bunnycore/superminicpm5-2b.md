# bunnycore/SuperMiniCPM5-2B

## Resumen

SuperMiniCPM5-2B es un adaptador LoRA publicado por el usuario bunnycore sobre el modelo base openbmb/MiniCPM5-2B. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (50.233.344 parámetros, unos 0,3 GB de repositorio), con librería declarada `peft` y pipeline `text-generation`. Los tags incluyen `lora`, `unsloth`, `transformers`, `gguf` y `base_model:adapter:openbmb/MiniCPM5-2B`, lo que indica que se entrenó con el ecosistema PEFT/Unsloth y que existe al menos un artefacto en formato GGUF.

El problema que resuelve es acotado: permitir especializar un modelo base de aproximadamente 2.000 millones de parámetros mediante fine-tuning eficiente en parámetros, sin necesidad de reentrenar ni redistribuir el modelo completo. La relevancia práctica depende por completo del modelo base, porque la model card del adaptador es la plantilla por defecto de HuggingFace sin rellenar: no documenta datos de entrenamiento, hiperparámetros, licencia, idiomas ni evaluación.

Se trata, por tanto, de un artefacto experimental con 0 descargas y 0 «likes» en el momento de la consulta, creado el 17 de septiembre de 2026 y actualizado ocho segundos después. No hay publicación, paper ni demo asociados, y la búsqueda web no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos corresponden a un simposio de hidrología sin relación alguna). Cualquier uso en producción requiere validación propia y comprobación previa de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer del modelo base openbmb/MiniCPM5-2B; arquitectura del base no disponible |
| Parametros totales | 50.233.344 (solo adaptador, dato real de safetensors); el modelo base sería de ~2B según su nomenclatura, cifra no confirmada en la informacion disponible |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (heredada del modelo base, sin documentar) |
| Tipos de cuantizacion | No disponibles los niveles concretos; los tags indican presencia de GGUF y de safetensors. El adaptador en si se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible para el adaptador; se aplican adicionalmente los terminos del modelo base openbmb/MiniCPM5-2B |
| Formato de pesos | Safetensors (adaptador PEFT) y GGUF segun tags del repositorio |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) en formato PEFT, framework declarado PEFT 0.18.1, pensado para cargarse sobre openbmb/MiniCPM5-2B mediante `transformers` + `peft`. El tag `unsloth` sugiere que el entrenamiento se realizó con esa librería de fine-tuning optimizada, pero no se especifican rango (`r`), `alpha`, `dropout`, módulos objetivo ni si se aplicó a todas las proyecciones lineales o solo a atención. El recuento de 50.233.344 parámetros de adaptador equivale a aproximadamente el 2,5 % de un modelo base de 2B, lo que es compatible con un LoRA de rango medio-alto sobre varios tipos de capa.

No hay información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos, la existencia de fases de RLHF, DPO o SFT, ni sobre regularización o precisión usada (fp16/bf16). Tampoco se documenta ninguna innovación técnica propia: el mérito arquitectónico, si lo hay, corresponde íntegramente al modelo base. El único enlace técnico presente en la model card es el tag `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de emisiones de CO2, citado en la plantilla estándar de HuggingFace, y no a un paper de este modelo.

## Capacidades

- Generación de texto y uso conversacional: es la única capacidad declarada de forma explícita mediante el pipeline `text-generation` y el tag `conversational`.
- Herencia de capacidades del modelo base: al ser un adaptador, conserva las capacidades de openbmb/MiniCPM5-2B (razonamiento, código, matemáticas, multilingüismo, etc.), pero no se documenta cuáles ni en qué medida se preservan tras el fine-tuning.
- Tool calling / function calling: no disponible; no se menciona en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo «thinking» o razonamiento explícito: no disponible.
- Idiomas: no disponibles; no se declara ninguna lista de lenguas soportadas.

## Casos de uso

- Especialización de un modelo de ~2B en un dominio concreto: el adaptador permite ajustar el comportamiento del modelo base a un estilo, jerga o conjunto de tareas específicas cargando solo 50,2 M de parámetros adicionales, lo que abarata el almacenamiento y el versionado frente a un fine-tuning completo.
- Despliegue conversacional ligero en hardware modesto: combinado con el modelo base cuantizado, el conjunto puede ejecutarse en GPUs de gama media o incluso en CPU para asistentes de chat internos, siempre que se valide la calidad real del adaptador.
- Prototipado rápido de asistentes de dominio: sirve como punto de partida para experimentar con instrucciones propias en atención al cliente, documentación técnica o soporte interno, sustituyendo el adaptador si los resultados no convencen.
- Investigación sobre fine-tuning eficiente: útil como caso de estudio de un adaptador entrenado con PEFT/Unsloth y exportado también a GGUF, para comparar pipelines de entrenamiento y de despliegue.
- Experimentación con `merge` de adaptadores: al ser un LoRA de 50,2 M de parámetros, puede fusionarse con los pesos del base o combinarse con otros adaptadores para explorar comportamientos híbridos.
- Evaluación de cadenas de herramientas PEFT + GGUF: permite probar el flujo completo de cargar un adaptador en `transformers`, fusionarlo y convertirlo a GGUF para `llama.cpp` u Ollama, verificando compatibilidad de versiones.

En todos los casos, la idoneidad real depende del modelo base y de la calidad no documentada del ajuste; los escenarios anteriores son aplicaciones plausibles del tipo de artefacto, no capacidades verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con el marcador `[More Information Needed]` en todos los apartados (datos de test, métricas y resultados), y no se ha localizado ninguna evaluación externa del adaptador ni del modelo base en la búsqueda realizada.

## Requisitos de hardware

- VRAM del adaptador: ~0,1 GB en fp16 (50.233.344 parámetros × 2 bytes ≈ 100 MB), coherente con un repositorio de 0,3 GB que incluye ficheros auxiliares.
- VRAM del conjunto (estimación a partir del tamaño del base, no dato publicado): ~4-5 GB en bf16/fp16 para un modelo de 2B, ~2,5 GB en cuantización de 8 bits y ~1,5 GB en 4 bits, más la caché KV que depende de la longitud de contexto real, no documentada.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede alojar el conjunto cuantizado; para bf16 completo se recomiendan 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, L4). Para servicio concurrente con lotes grandes, A100 o H100 aportan margen de sobra pero están sobredimensionadas para este tamaño.
- Compatibilidad con GPU de consumo: sí, previsiblemente en RTX 3060/4060 de 8-12 GB en cuantización de 4-8 bits y en GPUs integradas o CPU con cuantizaciones agresivas, sujeto a validación.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa del repositorio), vLLM con soporte de adaptadores LoRA, TGI, y `llama.cpp`/Ollama si el artefacto GGUF del repositorio es cargable.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No existe información publicada sobre el rendimiento de SuperMiniCPM5-2B, por lo que la comparación se limita a características estructurales de modelos de tamaño equivalente. Los datos de las alternativas provienen de sus fichas públicas.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| SuperMiniCPM5-2B (adaptador) | 50,2 M de adaptador sobre base de ~2B | No disponible | No disponible | Safetensors PEFT y GGUF; 0 descargas |
| Qwen2.5-1.5B | ~1,5B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF, amplio ecosistema |
| Llama 3.2 1B | ~1,2B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Safetensors, GGUF, amplio ecosistema |
| Gemma 2 2B | ~2,6B | 8.192 tokens | Terminos de uso de Gemma | Safetensors, GGUF, amplio ecosistema |

La diferencia fundamental no es de tamaño sino de madurez: las alternativas cuentan con fichas completas, evaluaciones publicadas, licencias explícitas y soporte de múltiples runtimes, mientras que este adaptador carece de toda esa documentación.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto sin rellenar; no hay datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada para el adaptador: al derivar de openbmb/MiniCPM5-2B, es imprescindible revisar los términos del modelo base antes de cualquier uso comercial, y no puede asumirse que el adaptador herede una licencia permisiva.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto en castellano ni en ninguna otra lengua concreta sin pruebas propias.
- Riesgo de alucinación y de degradación: al tratarse de un fine-tuning comunitario sin evaluación, no hay evidencia de que el ajuste no haya degradado capacidades del base (olvido catastrófico) ni de que el modelo base tenga una tasa de alucinación controlada.
- Sesgos desconocidos: sin información sobre la composición del dataset, no es posible caracterizar sesgos demográficos, culturales o lingüísticos.
- Contexto desconocido: la longitud de contexto efectiva del conjunto base + adaptador no está documentada; asumir la del modelo base puede dar lugar a errores en producción.
- Señales de adopción nulas: 0 descargas y 0 «likes», con creación y última actualización separadas por ocho segundos, lo que indica un artefacto sin uso ni validación por parte de la comunidad.
- Longevidad incierta del modelo base: si openbmb/MiniCPM5-2B no está disponible o cambia de condiciones, el adaptador queda inutilizable, ya que no incluye los pesos completos.
- Contenido de la model card: las secciones de uso fuera de alcance, impacto medioambiental y examen del modelo están vacías, por lo que no existe guía sobre usos desaconsejados.
- Trazabilidad limitada: el tag `arxiv:1910.09700` apunta al artículo de estimación de emisiones de CO2 de la plantilla, no a documentación del modelo; no debe interpretarse como referencia técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bunnycore/SuperMiniCPM5-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Librería PEFT: https://huggingface.co/docs/peft/index
- Unsloth: https://github.com/unslothai/unsloth
- Artículo citado en la plantilla (estimación de emisiones de CO2, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
- Nota sobre la búsqueda web: no se encontró ningún resultado relacionado con este modelo; los resultados devueltos corresponden al simposio WMHE 2026 (gestión de agua e hidráulica), sin relación con el modelo.
