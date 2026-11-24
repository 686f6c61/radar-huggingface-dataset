# ccmusic-database/GZ_IsoTech

## Resumen

GZ_IsoTech es un modelo de clasificación de audio entrenado para reconocer técnicas interpretativas del guzheng, un instrumento de cuerda pulsada de la tradición musical china. Lo desarrolla el proyecto ccmusic-database, un repositorio de investigación centrado en recuperación de información musical (MIR) sobre música china. El modelo resuelve un problema concreto de análisis musical: identificar automáticamente ocho técnicas de ejecución (vibrato o *chanyin*, deslizamiento ascendente o *shanghuayin*, descendente o *xiahuayin*, retorno o *huihuayin*, glissando o *guazou*/*huazhi*, pulsación con el pulgar o *yaozhi*, armónicos o *fanyin* y técnicas de pulsación como *gou*, *da*, *mo* y *tuo*) a partir de fragmentos de audio.

No es un modelo de lenguaje ni un transformer generativo: es un clasificador de audio basado en backbones de visión (ViT, ResNet, RegNet, MobileNet, MaxViT, ShuffleNet) aplicados sobre representaciones espectro-temporales del audio (Mel, CQT y Chroma). El modelo se distribuye como pesos entrenados con distintas combinaciones de backbone y representación, y su relevancia radica en que automatiza un análisis que tradicionalmente requiere oído experto, con aplicaciones en educación musical, etnomusicología y preservación del patrimonio.

El repositorio ocupa 5,9 GB e incluye múltiples variantes de backbone. La mejor configuración reportada es `vit_l_16` con espectrograma Mel, que alcanza una exactitud de 0,855. La licencia es MIT y el modelo se publica junto con su dataset homónimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de audio basado en backbones convolucionales y de visión (ViT-L/16, MaxViT-T, ResNeXt-101 64x4d, ResNet-101, RegNet-Y 8GF, ShuffleNetV2 x2.0, MobileNetV3-Large) sobre representaciones Mel, CQT y Chroma |
| Parametros totales | Variable según backbone: 5,5 M (MobileNetV3-Large) a 304,3 M (ViT-L/16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificación por fragmento de audio, no generativo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | No disponible en la información proporcionada (repo de 5,9 GB con pesos por variante) |

## Arquitectura y entrenamiento

El modelo sigue un pipeline clásico de clasificación de audio: extracción de características tiempo-frecuencia (espectrogramas Mel, Constant-Q Transform y Chroma), paso por un backbone de visión preentrenado y cabeza de clasificación sobre ocho clases de técnicas de guzheng. La model card menciona explícitamente el uso de "feature extraction, time-domain and frequency-domain analysis, and pattern recognition". Se evaluaron siete backbones con tres representaciones cada uno, lo que da 21 combinaciones posibles; los resultados se reportan en una tabla comparativa.

El entrenamiento se realizó sobre el dataset GZ_IsoTech, compuesto por 2.824 clips de audio: 2.328 procedentes de una librería de sonido virtual y 496 interpretados por un intérprete profesional de guzheng, cubriendo el rango tonal completo del instrumento. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo técnicas de aumento de datos o regularización más allá de lo implícito en el entrenamiento supervisado. No se menciona RLHF, DPO ni innovaciones como decodificación especulativa, al no ser un modelo generativo.

## Capacidades

- Clasificación de audio en ocho clases de técnicas interpretativas de guzheng: vibrato (*chanyin*), deslizamiento ascendente (*shanghuayin*), descendente (*xiahuayin*), retorno (*huihuayin*), glissando (*guazou*, *huazhi*), pulsación con pulgar (*yaozhi*), armónicos (*fanyin*) y técnicas de pulsación (*gou*, *da*, *mo*, *tuo*).
- Extracción de características en dominio temporal y frecuencial (Mel, CQT, Chroma).
- Reconocimiento automático de técnicas para análisis digital y educativo.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido textual; opera sobre audio musical.
- No dispone de modo "thinking", visión general, audio hablado ni otras capacidades generativas.

## Casos de uso

- Educación musical asistida: un estudiante de guzheng graba un fragmento y el modelo identifica qué técnicas ha ejecutado, permitiendo retroalimentación automática sobre la corrección de vibratos, deslizamientos y glissandos.
- Etiquetado automático de archivos de audio: digitalización de grabaciones históricas o de conservatorio para generar metadatos de técnica interpretativa que faciliten búsquedas y catalogación.
- Análisis etnomusicológico a escala: procesamiento de corpus amplios de música de guzheng para estudiar la distribución y frecuencia de técnicas en distintas escuelas o intérpretes.
- Preservación del patrimonio: documentación estructurada de las prácticas interpretativas del guzheng para su conservación y estudio académico.
- Herramientas de práctica interactiva: integración en aplicaciones que detecten en tiempo casi real la técnica ejecutada y guíen al intérprete.
- Evaluación objetiva en conservatorios: comparación cuantitativa de la ejecución de un alumno frente a referencias profesionales mediante la clasificación de técnicas.
- Investigación en MIR: uso como baseline o componente en pipelines de recuperación de información musical sobre instrumentos tradicionales chinos.

## Benchmarks y rendimiento

Resultados reportados en la model card (exactitud por backbone y representación):

| Backbone | Tamaño (M) | Mel | CQT | Chroma |
|---|---|---|---|---|
| vit_l_16 | 304,3 | **0,855** | **0,824** | **0,770** |
| maxvit_t | 30,9 | 0,763 | 0,776 | 0,642 |
| resnext101_64x4d | 83,5 | 0,713 | 0,765 | 0,639 |
| resnet101 | 44,5 | 0,731 | 0,798 | **0,719** |
| regnet_y_8gf | 39,4 | 0,804 | **0,807** | 0,716 |
| shufflenet_v2_x2_0 | 7,4 | 0,702 | 0,799 | 0,665 |
| mobilenet_v3_large | 5,5 | **0,806** | 0,798 | 0,657 |

La mejor configuración global es `vit_l_16` con Mel (0,855). Destaca que `mobilenet_v3_large` con solo 5,5 M de parámetros alcanza 0,806 en Mel, muy cerca del mejor resultado con una fracción del coste computacional.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los backbones (5,5 M a 304,3 M de parámetros), la inferencia es viable en GPUs de consumo con pocos GB de VRAM, especialmente para las variantes pequeñas (MobileNetV3, ShuffleNetV2).
- GPU recomendadas: cualquier GPU moderna es suficiente; para `vit_l_16` se recomienda al menos una RTX 3060/4090 o equivalente, aunque el modelo es pequeño en términos absolutos.
- Cabe en GPU de consumo: sí, todas las variantes caben holgadamente en GPUs consumer (RTX 3060 en adelante), e incluso las más pequeñas podrían ejecutarse en CPU con latencia aceptable.
- Opciones de despliegue: no se especifican en la información disponible; el repo usa `huggingface_hub` para descarga y el demo está en un Space de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación de técnicas de guzheng en la documentación proporcionada. La comparativa interna entre backbones del propio modelo se recoge en la sección de benchmarks. Como referencia de categoría, el modelo se enmarca en la línea de clasificadores de audio musical del proyecto CCMusic, pero no se aportan datos de otros modelos de la misma tarea para comparar parámetros, contexto, rendimiento o licencia.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GZ_IsoTech (vit_l_16 + Mel) | 304,3 M | No aplica | 0,855 exactitud | MIT | Hugging Face, ModelScope |
| Alternativas de la misma tarea | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El dataset combina 2.328 clips de librería virtual y solo 496 de intérprete profesional, lo que puede introducir un sesgo hacia sonidos sintéticos y reducir la generalización a grabaciones reales con ruido o micrófonos distintos.
- El modelo está entrenado exclusivamente para guzheng y ocho técnicas concretas; no reconoce otras técnicas, otros instrumentos ni otras tradiciones musicales.
- Riesgo de confusión entre técnicas acústicamente próximas (por ejemplo, distintos tipos de deslizamiento), como sugiere la matriz de confusión incluida en la model card.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo de clasificación musical el riesgo de alucinación no aplica en el sentido generativo; sí puede producir clasificaciones erróneas con alta confianza.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del dataset subyacente (librería de sonido virtual) antes de explotación comercial.
- No se especifican limitaciones de contexto ni de idioma al no ser un modelo textual.
- Para producción, conviene validar el rendimiento en el dominio concreto de despliegue (tipo de micrófono, sala, intérprete) dado el posible desajuste entre datos sintéticos y reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/GZ_IsoTech
- Demo (Space): https://huggingface.co/spaces/ccmusic-database/GZ_IsoTech
- Dataset: https://huggingface.co/datasets/ccmusic-database/GZ_IsoTech
- Mirror en ModelScope: https://www.modelscope.cn/models/ccmusic-database/GZ_IsoTech
- Repositorio de evaluación: https://github.com/monetjoe/ccmusic_eval
- Paper (CCMusic, TISMIR 2025): https://doi.org/10.5334/tismir.194
