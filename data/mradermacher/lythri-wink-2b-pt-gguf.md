# mradermacher/Lythri-Wink-2B-pt-GGUF

## Resumen

Lythri-Wink-2B-pt-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Lythri-Wink-2B-pt, publicada por el usuario mradermacher en Hugging Face. Se trata, por tanto, de un artefacto derivado: el autor original del modelo base es Lythri, y mradermacher se limita a generar versiones comprimidas listas para su uso con llama.cpp y herramientas compatibles. El repositorio no aporta informacion propia sobre arquitectura, datos de entrenamiento ni capacidades; toda la documentacion relevante reside en el repositorio del modelo original.

El modelo base, segun su nombre, tiene aproximadamente 2.000 millones de parametros y el sufijo "pt" sugiere que se trata de un checkpoint preentrenado (pre-trained) sin ajuste fino adicional. El sufijo "Wink" no tiene un significado documentado en la informacion disponible. La fecha de creacion del repositorio (18 de noviembre de 2026) y la ausencia total de descargas y likes indican que se trata de una publicacion muy reciente y practicamente sin adopcion en el momento de redactar esta ficha.

La relevancia de este repositorio es fundamentalmente practica: permite ejecutar el modelo en hardware de consumo mediante cuantizaciones de 2 a 8 bits, algo inviable con los pesos originales en precision completa. No obstante, la falta de model card descriptiva, licencia declarada e idiomas soportados limita seriamente su evaluacion para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Lythri-Wink-2B-pt) |
| Parametros totales | aproximadamente 2.000 millones (inferido del nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en el repositorio del modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre "Wink-2B" sugiere un transformer decoder-only de aproximadamente 2.000 millones de parametros, pero no se confirma ni el tipo de atencion, ni la presencia de componentes MoE, ni innovaciones como decodificacion especulativa o atencion lineal. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El sufijo "pt" apunta a un checkpoint preentrenado sin instrucciones, lo que implicaria ausencia de ajuste por instrucciones.

En cuanto al proceso de cuantizacion, la model card incluye metadatos tecnicos del pipeline de mradermacher: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que la conversion se realizo desde pesos en formato Hugging Face mediante su herramienta habitual de cuantizacion estatica. La etiqueta `skip_mmproj: 1` sugiere que no se ha incluido el proyector multimodal, lo que es coherente con un modelo de texto puro o con la omision deliberada de componentes de vision en las cuantizaciones.

## Capacidades

- Generacion de texto autoregresiva, asumiendo un transformer decoder-only estandar (no confirmado).
- Razonamiento y conocimiento general: no verificable sin benchmarks publicados.
- Generacion de codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible; improbable en un checkpoint "pt" sin ajuste por instrucciones.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible; la etiqueta `skip_mmproj` sugiere ausencia de vision en estas cuantizaciones.

## Casos de uso

- Experimentacion local con llama.cpp: las cuantizaciones Q4_K_M e IQ4_XS permiten cargar un modelo de 2B en equipos con 4-8 GB de RAM/VRAM, ideales para pruebas de inferencia en portatiles sin GPU dedicada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece hasta doce variantes (de Q2_K a f16), lo que facilita estudios de degradacion de calidad frente a tamano, un caso de uso tipico en investigacion de compresion de modelos.
- Prototipado rapido de pipelines de generacion de texto: al ser un checkpoint preentrenado, sirve para tareas de continuacion de texto y pruebas de infraestructura antes de migrar a modelos ajustados por instrucciones.
- Despliegue en entornos con recursos limitados: las variantes Q2_K y Q3_K_S ocupan muy poco espacio y pueden ejecutarse en dispositivos edge o contenedores con restricciones estrictas de memoria, aceptando la perdida de calidad asociada.
- Base para fine-tuning ligero: los pesos originales del modelo base (no estas cuantizaciones) podrian servir como punto de partida para ajuste en tareas especificas, aunque la falta de licencia clara es un obstaculo.
- Docencia y formacion: util para explicar el proceso de cuantizacion GGUF y comparar el comportamiento de un mismo modelo en distintos niveles de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, segun 2B parametros):
  - f16: en torno a 4-4,5 GB.
  - Q8_0: en torno a 2,2-2,5 GB.
  - Q6_K: en torno a 1,8-2 GB.
  - Q5_K_M / Q5_K_S: en torno a 1,5-1,7 GB.
  - Q4_K_M / Q4_K_S / IQ4_XS: en torno a 1,2-1,5 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: en torno a 1-1,2 GB.
  - Q2_K: en torno a 0,8-1 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones de 4 bits; para f16 se recomienda 6 GB o mas (RTX 3060, RTX 4060 Ti). En entornos profesionales, A100 o H100 no aportan ventaja significativa para un modelo de este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas, y en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, text-generation-webui y servidores compatibles con llama.cpp. vLLM y TGI no consumen GGUF de forma nativa en su configuracion estandar.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Lythri-Wink-2B-pt-GGUF | ~2B (inferido) | no disponible | no disponible | GGUF | Hugging Face |
| Modelos de ~2B con cuantizaciones GGUF de mradermacher (p. ej. variantes de Qwen2.5-1.5B o Gemma-2-2B) | 1,5-2B | 8K-32K en sus originales | Apache 2.0 / Gemma license | GGUF | Hugging Face |
| Llama 3.2 1B / 3B (cuantizado) | 1-3B | 128K | Llama 3.2 Community License | GGUF | Hugging Face, Ollama |

La comparacion detallada con alternativas concretas no es posible sin datos de rendimiento del modelo base; los modelos citados se incluyen como referencia de categoria (transformers pequenos con cuantizaciones GGUF disponibles), no como equivalencias verificadas.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay informacion sobre arquitectura, datos de entrenamiento, sesgos o rendimiento.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; se recomienda contactar con el autor original (Lythri) antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce la cobertura linguistica real del modelo.
- Riesgo elevado de alucinacion y respuestas incoherentes si el checkpoint "pt" no ha recibido ajuste por instrucciones; no debe usarse como asistente conversacional sin validacion previa.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) degradan notablemente la calidad en modelos pequenos; para uso practico se recomienda Q4_K_M o superior.
- Sesgos conocidos: no disponibles, pero al ser un modelo preentrenado sin alineacion documentada, es probable que reproduzca sesgos presentes en sus datos de entrenamiento.
- Sin adopcion ni validacion comunitaria (0 descargas, 0 likes en el momento de la ficha): no hay evidencia externa de su comportamiento.
- La omision del proyector multimodal (`skip_mmproj: 1`) implica que estas cuantizaciones no soportan entrada de imagenes aunque el modelo base pudiera hacerlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lythri-Wink-2B-pt-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Wink-2B-pt
