# Anadilorg/Anadil_Ladino_TTS

## Resumen

Anadil_Ladino_TTS es un adaptador LoRA de síntesis de voz (text-to-speech) para el ladino o judeoespañol (`lad`), una lengua romance derivada del español antiguo que la UNESCO clasifica como críticamente amenazada. El modelo ha sido desarrollado por Anadil.org, una comunidad de investigación independiente que emplea inteligencia artificial para preservar lenguas en peligro de Anatolia, y se publica bajo licencia MIT. El adaptador se entrena sobre el modelo base openbmb/VoxCPM2, un sistema de TTS de código abierto, y añade soporte específico para ladino mediante una adaptación de bajo rango en las capas de lenguaje y difusión.

El adaptador cuenta con aproximadamente 18,1 millones de parámetros (unos 70 MB en formato F32) y se ha entrenado con 2.283 segmentos de audio procedentes de un único locutor, lo que garantiza una voz consistente pero limita la variedad léxica y de pronunciación. La entrada se procesa a 16 kHz y la salida se genera a 48 kHz. Este modelo es el más reciente de la familia "Anadil" de adaptadores TTS para lenguas minorizadas, junto a modelos para laz, zaza, adigué y kurmanjí, y su relevancia radica en ofrecer una primera herramienta digital funcional para una lengua con muy pocos hablantes nativos, en su mayoría ancianos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre VoxCPM2 (transformer + DiT) |
| Parametros totales | 18,1 millones (solo adaptador; el modelo base VoxCPM2 tiene parametros adicionales) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de sintesis de voz, no de texto) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en F32; no se documentan cuantizaciones) |
| Idiomas soportados | Ladino (lad) principalmente; el entrenamiento incluye texto en turco (tr) para el marcado de idioma |
| Licencia | MIT |
| Formato de pesos | Safetensors (junto con archivos de configuracion y script de inferencia) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre VoxCPM2, un modelo de TTS de código abierto desarrollado por OpenBMB. VoxCPM2 combina un transformer autoregresivo para modelar el lenguaje con un modelo de difusión (DiT) para generar el espectrograma, y el adaptador se inserta en ambas partes (capas LM y DiT) con rango r=32 y alpha α=32. Esta configuración permite ajustar el modelo a una nueva lengua con un coste computacional reducido, sin modificar los pesos del modelo base.

El entrenamiento se realizó sobre un conjunto de datos propio de 2.283 segmentos de audio de un único locutor (identificado como `spk_tmp_001`), con grabaciones limpias en estudio. Se ejecutaron 10.000 pasos de optimización. No se emplearon técnicas de RLHF ni DPO, ya que la tarea es síntesis de voz y no generación de texto conversacional. La principal innovación técnica es la aplicación de LoRA a un modelo de TTS para una lengua con recursos extremadamente escasos, demostrando que es posible obtener una voz consistente con un volumen de datos moderado.

## Capacidades

- Sintesis de voz en ladino (judeoespañol) a partir de texto, con una voz femenina consistente (un unico locutor).
- Generacion de audio a 48 kHz de frecuencia de muestreo, con entrada de texto a 16 kHz.
- Soporte de marcado de hablante e idioma en el texto de entrada (por ejemplo, `[speaker:spk_tmp_001 language:lad]`), lo que permite controlar la voz y el idioma.
- Integracion con el ecosistema VoxCPM: se puede cargar como adaptador LoRA sobre el modelo base y usar la API de Python de VoxCPM para inferencia.
- No incluye capacidades de clonacion de voz, tool calling, razonamiento multi-paso ni procesamiento de vision o audio mas alla de la sintesis.
- El modelo esta disenado exclusivamente para TTS; no tiene capacidades de reconocimiento de voz ni de traduccion.

## Casos de uso

- Preservacion del patrimonio cultural: digitalizar textos historicos en ladino (cartas, libros, poemas) y convertirlos en audio para su archivo y difusion, aprovechando la voz sintetica como sustituto de grabaciones originales inexistentes.
- Educacion y aprendizaje de la lengua: generar materiales de audio para cursos de ladino, permitiendo a estudiantes escuchar pronunciacion correcta de frases y vocabulario sin depender de hablantes nativos.
- Audiolibros y contenido narrado: producir audiolibros de obras literarias sefardies o traducciones al ladino, facilitando el acceso a la cultura judeoespanola a personas con discapacidad visual o mayores que prefieren el audio.
- Asistentes de voz para comunidades sefardies: integrar el modelo en aplicaciones de asistencia por voz (por ejemplo, en dispositivos moviles) para que hablantes de ladino puedan interactuar en su lengua materna.
- Doblaje y produccion multimedia: crear voces en ladino para videos, podcasts o animaciones dirigidos a la comunidad sefardi, sin necesidad de contratar locutores profesionales.
- Investigacion linguistica y fonetica: generar muestras de habla sintetica para estudios sobre la fonologia del ladino, comparaciones con el español moderno o analisis de variantes dialectales.
- Accesibilidad en servicios publicos: proporcionar avisos o informacion en ladino en instituciones culturales o centros de atencion a personas mayores, mediante sistemas de megafonia o quioscos interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS (Mean Opinion Score) ni comparaciones con otros sistemas TTS. La ausencia de evaluaciones formales limita la valoracion cuantitativa de la calidad de la sintesis, aunque se proporcionan ejemplos de audio comparativos entre la voz original y la sintetizada en la pagina del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa aproximadamente 70 MB, pero el modelo base VoxCPM2 requiere una GPU con al menos 4-6 GB de VRAM para una inferencia fluida en tiempo real. En CPU la generacion es posible pero mas lenta.
- GPU recomendadas: NVIDIA RTX 3060 (6 GB) o superior, RTX 4090, A100 o H100 para despliegues de mayor rendimiento.
- Compatibilidad con GPU de consumo: si, el modelo puede ejecutarse en GPUs de gama media como la RTX 3060 o RTX 4070, siempre que se disponga de suficiente VRAM para el modelo base.
- Opciones de despliegue: el script de inferencia proporcionado (`inference.py`) usa la libreria VoxCPM; tambien se puede integrar en pipelines de Python con `torch` y `soundfile`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que son herramientas orientadas a LLMs y no a TTS.
- Latencia y throughput: no disponibles. Se recomienda evaluar en el hardware objetivo, dado que la generacion de audio depende del modelo de difusion y del tamaño del texto.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos TTS para lenguas en peligro en la informacion proporcionada. Existe un proyecto relacionado, Ladino_TTS de CollectivaT-dev, que tambien desarrolla un sistema TTS para judeoespanol, pero no se aportan especificaciones tecnicas ni resultados comparables. Como referencia cualitativa, el adaptador Anadil se distingue por su tamaño reducido y su integracion con VoxCPM2, mientras que otros enfoques pueden usar arquitecturas diferentes. La comparacion con el modelo base VoxCPM2 (sin adaptador) muestra que este ultimo no soporta ladino de forma nativa, siendo el adaptador el que anade esa capacidad.

| Modelo | Arquitectura | Parametros | Lengua | Licencia |
|---|---|---|---|---|
| Anadil_Ladino_TTS | LoRA sobre VoxCPM2 | 18,1M (adaptador) | Ladino | MIT |
| VoxCPM2 (base) | Transformer + DiT | No disponible | Multilingue (sin ladino) | MIT |
| Ladino_TTS (CollectivaT) | No disponible | No disponible | Ladino | No disponible |

## Limitaciones y advertencias

- Dataset de entrenamiento reducido (2.283 segmentos) en comparacion con otros modelos de la familia Anadil (por ejemplo, el de kurmanji usa 65.102 segmentos), lo que limita la cobertura lexica y la variedad de pronunciacion.
- Voz unica y fija: el modelo solo genera la voz del locutor `spk_tmp_001`; no permite clonar voces ni seleccionar entre multiples hablantes.
- Posibles errores de pronunciacion o alucinaciones foneticas en palabras poco frecuentes o extranjerismos, debido al escaso volumen de datos.
- El ladino presenta variantes dialectales (turco, balcanico, norteafricano); el modelo puede estar sesgado hacia la variante hablada en Turquia, dado el origen del dataset.
- No se han realizado evaluaciones formales de calidad (MOS) ni pruebas de robustez en entornos ruidosos, por lo que su rendimiento en produccion no esta garantizado.
- La licencia MIT permite uso comercial, pero el modelo se ofrece "tal cual", sin soporte tecnico ni garantias.
- Para aplicaciones criticas (por ejemplo, servicios de emergencia), se recomienda validar previamente la calidad de la sintesis con audicion humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anadilorg/Anadil_Ladino_TTS
- Perfil de Anadil.org en Hugging Face: https://huggingface.co/Anadilorg
- Sitio web de Anadil.org: https://www.anadil.org/
- Repositorio de AnadilOrg en GitHub: https://github.com/AnadilOrg
- Proyecto relacionado Ladino_TTS (CollectivaT): https://github.com/CollectivaT-dev/Ladino_TTS
- Paper relacionado: "Preparing an endangered language for the digital age: The Case of Judeo-Spanish" (Alp Öktem et al.)
