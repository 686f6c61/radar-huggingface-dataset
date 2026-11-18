# Hujaifa01/OMR-Scanner

## Resumen

OMR-BlindNet-v1 es una red neuronal convolucional residual ligera disenada especificamente para la correccion automatica de hojas de respuestas tipo test (OMR, optical mark recognition). El modelo lo publica el usuario Hujaifa01 en Hugging Face bajo licencia MIT y su proposito es detectar si la letra impresa de una opcion (A, B, C, D, E) dentro de una burbuja ha quedado ocluida por la marca del estudiante, en lugar de exigir un relleno perfecto del circulo. Esto lo hace robusto frente a marcas parciales, puntos en el centro, ticks, cruces, garabatos inclinados o sombreado a lapiz, y permite ignorar letras impresas sin marcar, sombras, borrados tenues y motas en el borde.

Tecnicamente es una CNN residual con modulos Squeeze-and-Excitation que recibe tensores de 4 canales y 32x32 pixeles (RGB normalizado mas un mapa de oclusion de tinta oscura con resta de fondo local). El modelo se distribuye como un fichero ONNX de aproximadamente 1,7 MB y se ejecuta en CPU sin necesidad de PyTorch en inferencia, procesando unas 240 burbujas (equivalentes a unos 60 MCQs) en torno a 15 ms. Es relevante para pipelines de correccion de examenes a gran escala por su bajo coste computacional y su enfoque en condiciones reales de escaneo.

La ficha se basa unicamente en la informacion disponible en la model card y en los metadatos del repositorio; los datos no publicados se indican explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual con modulos Squeeze-and-Excitation (4 canales de entrada, 3 etapas residuales SE, pooling dual avg/max) |
| Parametros totales | no disponible (pesos ONNX de ~1,7 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 32x32 por burbuja) |
| Tipos de cuantizacion | no disponible (se distribuye directamente en ONNX) |
| Idiomas soportados | no disponible (no procesa texto; reconoce letras impresas A-E) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`); el autor menciona tambien PyTorch como origen del entrenamiento |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es una CNN residual compacta. La entrada es un tensor `(batch, 4, 32, 32)` en `float32` con cuatro canales: R/255, G/255, B/255 y un mapa de oclusion de tinta oscura en el rango [0, 1] obtenido mediante resta del fondo local. El canal rojo normalizado sirve para suprimir formularios impresos en rojo o granate. El backbone consta de una convolucion stem de 4 a 32 canales, tres etapas residuales con Squeeze-and-Excitation que escalan 32→64→128→192 canales, y una cabeza con pooling dual (average y max) que pasa de 384 a 96 y finalmente a 1 salida (probabilidad de oclusion).

No se especifican en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento, mas alla de que se entreno con hojas OMR del mundo real en impresion roja, granate, azul, verde y blanco y negro. Tampoco se documenta si hubo RLHF, DPO u otras tecnicas de alineacion (no aplicables a este tipo de modelo). La innovacion destacable es el canal explicito de oclusion de tinta y la deteccion de la letra impresa subyacente, que evita depender de un umbral de relleno y marca automaticamente como incorrectas las respuestas con doble o multiple marca.

## Capacidades

- Clasificacion binaria por burbuja: determina si la letra impresa ha quedado ocluida por la marca del estudiante.
- Tolerancia a marcas imperfectas: relleno completo, relleno parcial del centro, punto rapido en el centro, tick, cruz, garabato inclinado y sombreado a lapiz.
- Discriminacion de ruido: ignora letras impresas sin ocluir, sombras, borrados tenues y pequenas motas en el borde del circulo.
- Deteccion de doble o multiple marca en un mismo MCQ, marcandolo automaticamente como incorrecto.
- Procesamiento por lotes de burbujas sobre una hoja completa mediante la API `predict_bubbles_on_sheet`.
- Soporte de entrada en imagen (JPG) y PDF multipagina a traves de la CLI `omr-blindnet check`.
- Exportacion de resultados a CSV y comparacion contra una clave de respuestas (`--key`).
- Inferencia en CPU sin PyTorch, gracias al runtime ONNX.
- No soporta tool calling, agentes, razonamiento multietapa ni capacidades multilingues: es un modelo de vision especializado.

## Casos de uso

- Correccion automatica de examenes tipo test en centros educativos: la CLI permite procesar un PDF multipagina con una clave de respuestas y exportar los resultados a CSV, lo que encaja en flujos de evaluacion masiva con coste de CPU minimo.
- Digitalizacion de hojas escaneadas en blanco y negro o en color: el canal rojo normalizado y el mapa de oclusion permiten usar el modelo con formularios impresos en distintos colores sin reentrenar.
- Deteccion de respuestas dobles o ambiguas: el modelo marca como incorrectos los MCQs con multiple marca, lo que ayuda a identificar casos que requieren revision manual.
- Integracion en plataformas de gestion de examenes: el paquete Python (`OMRBlindNetONNX.from_pretrained`) permite incorporar la inferencia dentro de un servicio web o un pipeline de correccion.
- Procesamiento en dispositivos sin GPU: al ejecutarse en ONNX Runtime sobre CPU y pesar ~1,7 MB, es viable en servidores modestos, portatiles o entornos edge.
- Correccion de examenes con marcas rapidas o descuidadas: la tolerancia a ticks, puntos y garabatos reduce los falsos negativos frente a metodos basados en umbral de relleno.
- Prototipado rapido en investigacion educativa: la API por burbujas permite experimentar con coordenadas y radios sin depender de un pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento aportado por el autor es operativo: unas 240 burbujas (aproximadamente 60 MCQs) procesadas en torno a 15 ms en CPU. No se detallan metricas de precision, recall, F1 ni comparaciones con otros sistemas OMR.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia se ejecuta en CPU con ONNX Runtime.
- GPU recomendadas: no necesarias; el modelo esta pensado para CPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso principal, aunque al ser ONNX podria ejecutarse en GPU si el runtime lo permite (no documentado).
- Opciones de despliegue: ONNX Runtime (libreria declarada), paquete Python `omr_blindnet` con `OMRBlindNetONNX`, y CLI `omr-blindnet`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~15 ms para ~240 burbujas en CPU segun el autor; no se especifica el hardware exacto de la medicion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de OMR ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en OMR de opciones multiples; no es un modelo de lenguaje ni de vision general.
- No se documentan sesgos conocidos, pero al entrenarse con formularios de ciertos colores y estilos de impresion podria degradarse con disenos no representados en el dataset.
- Riesgo de falsos positivos o negativos en marcas muy tenues, borrados parciales o ruido de escaneo; no se publican metricas de error.
- La deteccion se limita a letras impresas A-E dentro de burbujas; no se describe soporte para otros alfabetos o simbolos.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0.0 GB en los metadatos, lo que sugiere que la publicacion es muy reciente o que los artefactos no estan completamente subidos; conviene verificar la disponibilidad real de `model.onnx` antes de integrarlo.
- La licencia MIT permite uso comercial, pero no se especifican garantias ni condiciones adicionales sobre los datos de entrenamiento.
- Para produccion conviene validar el modelo con una muestra representativa de las hojas propias antes de confiar en la correccion automatica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hujaifa01/OMR-Scanner
- Repositorio del autor en Hugging Face: https://huggingface.co/Hujaifa01
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos adicionales.
