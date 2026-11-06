# Ambarella/EfficientViT

## Resumen

EfficientViT es una familia de modelos de visión por computador diseñada específicamente para predicción densa de alta resolución, como segmentación semántica o estimación de profundidad. Lo desarrolla el equipo de investigación de MIT, con Han Cai, Junyan Li, Muyang Li, Song Han y otros autores, y esta ficha en concreto corresponde a una publicación de Ambarella en HuggingFace con los pesos compilados para sus aceleradores de visión (SoCs de la familia CV y N1). El modelo se apoya en un bloque de atención lineal multi-escala que logra un campo receptivo global con operaciones hardware-friendly, lo que se traduce en aceleraciones notables frente a transformers de visión convencionales tanto en CPU móvil como en GPU de borde y de nube.

La variante publicada es EfficientViT-L2, el modelo más grande de la familia, con resolución de entrada 3x512x512. El repositorio incluye pesos en formato PyTorch y binarios precompilados para los dispositivos N1-655, X7, CV7, CV72 y CV75 de Ambarella, con activaciones en fp16. Es un modelo de visión puro: no genera texto ni código, y su utilidad está en pipelines de percepción visual en tiempo real.

Su relevancia actual radica en que demuestra que es posible mantener calidad de predicción densa en resoluciones altas sin el coste cuadrático de la atención estándar, lo que lo hace atractivo para despliegues en cámaras inteligentes, vehículos y sistemas embebidos con presupuesto energético limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer con atención lineal multi-escala (EfficientViT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 3x512x512) |
| Tipos de cuantizacion | no disponible (los binarios publicados usan activaciones fp16) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) y binarios compilados para SoCs Ambarella (.bin) |

## Arquitectura y entrenamiento

EfficientViT sustituye la self-attention cuadrática habitual por un módulo de atención lineal multi-escala que combina agregación local con proyecciones lineales globales, manteniendo un campo receptivo global a coste lineal respecto al número de tokens. La red se organiza en etapas con resolución decreciente, e incluye operaciones de fusión multi-escala para preservar detalle fino en tareas densas. El diseño prioriza operaciones eficientes en hardware (convoluciones 1x1, depthwise y atención lineal) para maximizar el throughput en CPU, GPU de borde y aceleradores dedicados.

No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado específico. La model card remite al paper original (arXiv:2205.14756) para los detalles de entrenamiento. La innovación técnica destacable es precisamente el bloque de atención lineal multi-escala, que permite procesar imágenes de 512x512 con coste contenido y habilita el despliegue en los SoCs Ambarella listados.

## Capacidades

- Predicción densa de alta resolución: segmentación semántica, estimación de profundidad y otras tareas por píxel.
- Visión por computador genérica como backbone para tareas de percepción visual.
- Procesamiento de imágenes de 512x512 con campo receptivo global gracias a la atención lineal multi-escala.
- Inferencia eficiente en CPU móvil, GPU de borde y GPU de nube.
- Despliegue en aceleradores Ambarella (N1-655, X7, CV7, CV72, CV75) mediante binarios precompilados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo exclusivamente visual.

## Casos de uso

- Segmentación semántica en cámaras de vigilancia: el modelo procesa fotogramas de 512x512 en tiempo real sobre SoCs Ambarella CV7 o CV75, permitiendo separar personas, vehículos y fondo sin enviar vídeo a la nube.
- Estimación de profundidad monocular en vehículos y robots: al mantener detalle fino en resoluciones altas, resulta adecuado para generar mapas de profundidad densos a bordo con latencia baja.
- Percepción en drones y dispositivos de borde: su coste lineal en atención permite ejecutar el backbone en GPU de borde con presupuesto energético reducido.
- Preprocesado en pipelines de visión industrial: detección de defectos o segmentación de piezas en líneas de fabricación donde se requiere inferencia local y determinista.
- Backbone para tareas densas personalizadas: al ser un modelo de visión puro, se puede usar como extractor de características y añadir cabezas específicas para segmentación de cultivos, análisis médico o teledetección.
- Prototipado rápido en investigación: los pesos PyTorch permiten reproducir el modelo de referencia y comparar frente a otros backbones eficientes antes de compilar para hardware dedicado.
- Despliegue en cámaras inteligentes con Ambarella Cooper SDK: los binarios .bin permiten integrar el modelo en el pipeline de la Foundry (versiones 2.3 y SDK 2.5.4) sin necesidad de conversión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,4 GB, lo que da una idea del orden de magnitud de los pesos.
- GPU recomendadas: no se especifican en la model card; el paper original reporta aceleraciones en CPU móvil, GPU de borde y GPU de nube, pero sin cifras concretas en esta ficha.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se confirma en la información disponible.
- Opciones de despliegue: PyTorch (pesos .pt), binarios compilados para Ambarella N1-655, X7, CV7, CV72 y CV75 con activaciones fp16. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| EfficientViT-L2 (esta ficha) | no disponible | 3x512x512 | no disponible | HuggingFace + binarios Ambarella |
| EfficientViT (familia original, MIT) | varias variantes (B0-B3, L0-L3) | hasta 3x512x512 | según paper original | GitHub CVHub520/efficientvit |
| Otros backbones eficientes (p. ej. MobileViT, FastViT) | no disponible en esta ficha | variable | variable | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto, no soporta tool calling ni agentes, y no debe evaluarse como un LLM.
- No se especifica la licencia en la model card; es imprescindible verificar los términos antes de un uso comercial, especialmente en productos derivados.
- Los binarios publicados están atados a versiones concretas del SDK de Ambarella (Cooper SDK 2.5.4 y Cooper Foundry 2.3); cambios de versión pueden requerir recompilación.
- No se documentan sesgos ni riesgos de alucinación, pero al ser un modelo de percepción visual hereda los sesgos de los datasets de entrenamiento originales (no detallados aquí).
- La información sobre parámetros, datos de entrenamiento y benchmarks es escasa en esta ficha; para evaluación rigurosa conviene consultar el paper original.
- El número de descargas (15) y likes (0) es bajo, lo que sugiere poca validación comunitaria en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/Ambarella/EfficientViT
- Paper original: https://arxiv.org/abs/2205.14756
- Repositorio de referencia: https://github.com/CVHub520/efficientvit
- Pesos originales (l2.pt): https://www.dropbox.com/scl/fi/565wb47z1f5re9jckr42t/l2.pt?rlkey=ojffxngf6iv0oiost6c2tskul&dl=0
- Binario N1-655: https://huggingface.co/Ambarella/EfficientViT/blob/main/n1-655_efficientvit_l2_act16.bin
- Binario X7: https://huggingface.co/Ambarella/EfficientViT/blob/main/x7_efficientvit_l2_act16.bin
- Binario CV7: https://huggingface.co/Ambarella/EfficientViT/blob/main/cv7_efficientvit_l2_act16.bin
- Binario CV72: https://huggingface.co/Ambarella/EfficientViT/blob/main/cv72_efficientvit_l2_act16.bin
- Binario CV75: https://huggingface.co/Ambarella/EfficientViT/blob/main/cv75_efficientvit_l2_act16.bin
