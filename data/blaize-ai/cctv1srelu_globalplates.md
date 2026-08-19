# Blaize-AI/CCTv1sRelu_GlobalPlates

## Resumen

CCTv1sRelu_GlobalPlates es un modelo de reconocimiento óptico de caracteres (OCR) especializado en matrículas de vehículos, desarrollado por Blaize-AI como parte de su ecosistema de inferencia en el edge. El modelo se basa en la arquitectura Compact Transformer (CCT) propuesta por Hassani et al. en 2021, y utiliza los pesos del proyecto open source fast-plate-ocr, optimizados para ejecutarse en los aceleradores Blaize Xplorer mediante el SDK Picasso. Su objetivo es ofrecer una solución rápida y ligera para el reconocimiento de placas de matrícula a nivel global, cubriendo 74 países con más de 5 millones de imágenes de entrenamiento.

El modelo se distribuye en formato binario específico de Blaize (`.bm`), con una variante en BF16 y resolución de entrada de 128×64 píxeles. Está pensado para despliegues en dispositivos de borde donde se requiere baja latencia y alta eficiencia energética, aprovechando la arquitectura Graph Streaming Processor (GSP) de Blaize. Aunque el modelo en sí tiene licencia MIT, el dataset de entrenamiento (GlobalPlates) está bajo CC-BY-NC-ND-4.0, lo que puede condicionar su uso comercial dependiendo de la interpretación legal.

La relevancia actual de este modelo radica en la creciente demanda de sistemas de visión por computador en el edge para aplicaciones de peaje, control de acceso y vigilancia, donde la privacidad y la latencia son críticas. Al estar optimizado para hardware específico, ofrece un rendimiento predecible y un consumo reducido, aunque limita su portabilidad a otras plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compact Transformer (CCT) - Hassani et al., 2021 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 128×64) |
| Tipos de cuantizacion | BF16 (disponible), INT8 y AMP (mencionados en la documentacion) |
| Idiomas soportados | no disponible (OCR de matrículas multinacional) |
| Licencia | MIT (modelo); dataset de entrenamiento: CC-BY-NC-ND-4.0 |
| Formato de pesos | `.bm` (binario de Blaize), originalmente ONNX |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Compact Transformer (CCT), que reduce el coste computacional de los transformers estándar mediante la tokenización de la imagen en parches y la eliminación de la capa de embedding posicional, manteniendo un rendimiento competitivo en tareas de clasificación y OCR. Los pesos provienen del proyecto fast-plate-ocr (versión 1.0), que fue entrenado con el dataset GlobalPlates, un conjunto a gran escala de imágenes de matrículas de 74 países (más de 5 millones de imágenes). El dataset no está disponible públicamente y se distribuye bajo licencia CC-BY-NC-ND-4.0.

El entrenamiento se realizó con el framework ONNX y posteriormente se optimizó para el hardware Blaize Xplorer mediante el SDK Picasso, que convierte el grafo del modelo a la representación nativa del GSP. Esta optimización incluye técnicas de cuantización (BF16, INT8 y AMP) para equilibrar precisión y velocidad. No se especifican detalles sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión, no de lenguaje.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) en matrículas de vehículos, con soporte para 74 países.
- Inferencia de baja latencia y alta eficiencia energética, diseñada para dispositivos de borde.
- Variantes de cuantización (BF16, INT8, AMP) que permiten ajustar el equilibrio entre precisión y velocidad.
- Compatible con el SDK Picasso para despliegue en aceleradores Blaize Xplorer.
- Entrada de imagen de 128×64 píxeles, optimizada para capturas de cámaras de vigilancia o peaje.
- No incluye capacidades de tool calling, agentes ni procesamiento de lenguaje natural, ya que es un modelo puramente visual.

## Casos de uso

- Peaje automático: el modelo puede integrarse en sistemas de cobro sin parada, leyendo matrículas en tiempo real con baja latencia. Su tamaño reducido permite ejecutarlo en hardware de borde instalado en los pórticos de peaje, evitando la dependencia de la nube.
- Control de acceso en aparcamientos: reconocimiento de matrículas para abrir barreras y gestionar plazas. La precisión multinacional es útil en zonas con gran afluencia de vehículos extranjeros.
- Vigilancia y seguridad: identificación de vehículos en vídeo para alertas de listas negras o seguimiento de movimientos. La inferencia local preserva la privacidad al no enviar imágenes a servidores externos.
- Gestión de flotas: lectura automática de matrículas en entradas y salidas de depósitos o bases logísticas, agilizando el registro de movimientos.
- Ciudades inteligentes: monitorización de tráfico y detección de infracciones (por ejemplo, vehículos en carriles prohibidos) mediante cámaras con análisis en el borde.
- Sistemas de alquiler de vehículos: verificación de la matrícula en la devolución del coche, comparando con la imagen del contrato, sin necesidad de intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como exactitud, precisión o recall sobre conjuntos de prueba, ni comparaciones con otros modelos de OCR de matrículas.

## Requisitos de hardware

- Acelerador Blaize Xplorer AI (obligatorio, no compatible con GPUs estándar).
- SDK Picasso instalado y configurado.
- El modelo se distribuye en formato `.bm`, que solo puede ejecutarse en hardware Blaize.
- No se proporcionan cifras de VRAM, latencia ni throughput. Al ser un modelo ligero y optimizado para el edge, se espera un consumo de memoria reducido, pero no hay datos oficiales.
- No es posible desplegarlo en plataformas comunes como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje y su formato es propietario.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con alternativas como otros OCR de matrículas (por ejemplo, YOLO-based o LPRNet). La model card no menciona resultados frente a otros modelos, y el hardware específico limita la comparación directa en términos de rendimiento. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para hardware Blaize Xplorer; no es portable a GPUs o CPUs convencionales sin una conversión adicional que no está documentada.
- El dataset de entrenamiento (GlobalPlates) tiene licencia CC-BY-NC-ND-4.0, que prohíbe el uso comercial del dataset en sí, aunque el modelo se distribuye bajo MIT. Esta discrepancia puede generar riesgos legales si se utiliza el modelo en aplicaciones comerciales, ya que los pesos derivan de un dataset con restricciones.
- No se especifican los idiomas ni los alfabetos soportados; aunque se menciona cobertura de 74 países, no se detalla si incluye caracteres no latinos (por ejemplo, árabe, cirílico o chino).
- El modelo solo acepta imágenes de 128×64 píxeles, lo que puede limitar la precisión en matrículas muy pequeñas o con baja resolución.
- No hay información sobre sesgos o comportamientos en condiciones adversas (iluminación, ángulos, oclusiones), ni sobre la robustez ante variaciones del mundo real.
- Al ser una versión optimizada para un acelerador específico, el rendimiento en otros entornos no es evaluable, y no se ofrecen garantías de soporte más allá del ecosistema Blaize.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blaize-AI/CCTv1sRelu_GlobalPlates
- Repositorio fast-plate-ocr: https://github.com/ankandrew/fast-plate-ocr
- Dataset GlobalPlates: https://github.com/siddagra/Global-License-Plate-Dataset
- Paper Compact Transformers: https://arxiv.org/abs/2104.05704
- Paper Global License Plate Dataset: https://arxiv.org/abs/2405.10949
- Sitio web de Blaize: https://www.blaize.com
