# Phoonnx/vits-hf_community_WitoldG_polish_piper_models_pl_PL-justyna_wg_glos-medium

## Resumen

Este repositorio contiene un modelo de síntesis de voz (text-to-speech) en formato ONNX basado en la arquitectura VITS, empaquetado para su uso con la librería `phoonnx`. Se trata de una extracción de una única voz del repositorio agregador `Phoonnx/phoonnx-vits`, concretamente la carpeta `hf_community__WitoldG__polish_piper_models__pl_PL-justyna_wg_glos-medium`. Por el nombre se deduce que es una voz en polaco (pl_PL) llamada "justyna", de calidad "medium", procedente del ecosistema de voces Piper y originalmente publicada por el usuario WitoldG.

El modelo no aporta arquitectura propia ni innovaciones: es una conversión a ONNX de un checkpoint VITS entrenado para Piper, el sistema de TTS ligero de rhasspy. Su relevancia es práctica: permite integrar una voz polaca concreta en aplicaciones que usan el motor phoonnx sin depender del formato original de Piper. El repositorio es muy pequeño (0,1 GB), lo que confirma que se trata de un modelo compacto de TTS, no de un modelo de lenguaje.

No hay información publicada sobre el proceso de entrenamiento, el dataset utilizado ni métricas de calidad. La model card es mínima y se limita a indicar la procedencia de los ficheros y las condiciones de licencia heredadas del repositorio fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (repo en ONNX; el tamaño de 0,1 GB sugiere pesos ya compactos) |
| Idiomas soportados | polaco (pl_PL), segun el identificador de la voz; no confirmado en la model card |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un generador neuronal (típicamente HiFi-GAN) para producir audio directamente desde fonemas. El modelo se distribuye como grafo ONNX, lo que permite inferencia en CPU y GPU sin depender de PyTorch.

No se dispone de información sobre el dataset de entrenamiento, el número de horas de audio, el hablante de origen ni si hubo ajuste fino. El sufijo "medium" indica, en la convención de Piper, un compromiso entre calidad y velocidad, con menor coste computacional que las voces "high". Tampoco hay datos sobre el front-end fonético utilizado en esta voz concreta.

## Capacidades

- Síntesis de voz a partir de texto en polaco, orientada a la voz "justyna".
- Generación de audio en formato ONNX, ejecutable con el motor phoonnx.
- Compatible con el ecosistema Piper (voces de rhasspy), lo que facilita su reutilización en pipelines existentes.
- Inferencia ligera: el tamaño del repositorio (0,1 GB) permite despliegue en entornos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo TTS.
- No se documentan capacidades multilingües más allá del polaco.

## Casos de uso

- Lectura de artículos y noticias en polaco: el modelo convierte texto plano en audio para aplicaciones de accesibilidad o podcasts automatizados, con un coste de inferencia bajo gracias a su tamaño reducido.
- Asistentes de voz para dispositivos embebidos: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en Raspberry Pi o hardware similar con el motor phoonnx para respuestas habladas en polaco.
- Sistemas de navegación o anuncios públicos: generación de avisos de voz pregrabados dinámicamente en polaco para transporte, aeropuertos o comercios.
- Audiolibros y contenido educativo: síntesis de material didáctico en polaco con una voz consistente, integrable en pipelines de generación por lotes.
- Integración en aplicaciones de lectura de pantalla: sustitución o complemento de motores TTS genéricos con una voz polaca específica de calidad media.
- Pruebas de concepto de TTS en producción: al estar bajo licencia MIT y en formato ONNX, es adecuado para prototipos y despliegues comerciales sin restricciones de licencia complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se espera un consumo muy bajo, inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una GPU integrada pueden ejecutar el modelo sin problemas.
- Cabe en GPU de consumo: sí, con amplio margen; también en CPU.
- Opciones de despliegue: motor phoonnx (librería nativa del repo); al ser ONNX, puede ejecutarse con ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no están orientados a TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (justyna, medium) | VITS | Polaco | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper pl_PL (p. ej. del repo original WitoldG) | VITS | Polaco | Según la voz original | ONNX / Piper | Repositorios Piper y Hugging Face |
| Modelos TTS multilingües tipo XTTS | Transformer + VQ | Multilingüe | Varía (a menudo no comercial) | PyTorch | Hugging Face / Coqui |
| Modelos TTS comerciales (Azure, Google) | Propietaria | Multilingüe | Propietaria | API | Servicios cloud |

La comparación detallada con alternativas concretas no está disponible en la información proporcionada; los datos de las filas de XTTS y servicios comerciales son orientativos de categoría y no se han verificado en esta ficha.

## Limitaciones y advertencias

- La model card no documenta el dataset ni el hablante de origen; se desconoce si existen sesgos de género, edad o acento en la voz.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí puede haber errores de pronunciación en palabras fuera del vocabulario de entrenamiento o en nombres propios.
- El idioma soportado no está confirmado explícitamente en la model card; el identificador sugiere polaco, pero conviene validarlo antes de producción.
- La licencia MIT se hereda del repositorio fuente, pero la propia model card advierte que algunas voces del agregador no tienen licencia declarada y llevan `license: other`; conviene revisar la carpeta original antes de un uso comercial.
- No hay métricas de calidad (MOS, WER) publicadas, por lo que no se puede garantizar un nivel de naturalidad concreto.
- Al ser un modelo TTS puro, no ofrece capacidades de razonamiento, tool calling ni generación de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_WitoldG_polish_piper_models_pl_PL-justyna_wg_glos-medium
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-vits
- Motor phoonnx: https://github.com/TigreGotico/phoonnx
- Voces Piper (rhasspy): https://github.com/rhasspy/piper
