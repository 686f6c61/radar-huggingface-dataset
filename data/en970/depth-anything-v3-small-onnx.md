# en970/depth-anything-v3-small-onnx

## Resumen

Depth Anything V3 Small en su versión ONNX cuantizada a 8 bits, publicada por el usuario en970. Se trata de un export optimizado del modelo original `onnx-community/depth-anything-v3-small`, pensado para su uso en el visor de profundidad en tiempo real `depth-realtime`, que se ejecuta directamente en el navegador mediante Transformers.js. El modelo base, Depth Anything V3, es desarrollado por ByteDance Seed y predice geometría espacialmente consistente a partir de entradas visuales arbitrarias, con o sin poses de cámara conocidas, mediante un paradigma de entrenamiento teacher-student.

La relevancia de esta versión ONNX radica en su reducción drástica de tamaño: pasa de 105 MB (float32) a 28,9 MB, lo que permite cargar el modelo en una página web sin penalizar significativamente la experiencia de usuario. Las pruebas de fidelidad del autor muestran una correlación de Pearson superior a 0,99 en tres escenas de prueba, con tiempos de inferencia entre 90 y 113 ms a 322 píxeles de entrada, lo que lo hace viable para aplicaciones interactivas en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Depth Anything V3, probablemente basado en transformer visual) |
| Parametros totales | no disponible (el archivo ONNX pesa 28,9 MB cuantizado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | 8-bit dinamico (int8) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no aplica, es un export ONNX) |

## Arquitectura y entrenamiento

El modelo original Depth Anything V3, desarrollado por ByteDance Seed, emplea un esquema de entrenamiento teacher-student para lograr un nivel de detalle y generalizacion comparable al de Depth Anything V2. La version Small es la variante mas ligera de la familia, disenada para entornos con recursos limitados. Este export concreto toma los pesos float32 de `onnx-community/depth-anything-v3-small` y los convierte a ONNX con cuantizacion dinamica de 8 bits, reduciendo el tamano del archivo de 105 MB a 28,9 MB. La cuantizacion dinamica ajusta los pesos y activaciones durante la inferencia, lo que introduce una ligera perdida de precision que, segun las mediciones del autor, se traduce en una correlacion de Pearson superior a 0,99 respecto al original en escenas representativas.

No se dispone de informacion detallada sobre el numero de parametros, la composicion del dataset de entrenamiento ni las tecnicas de regularizacion empleadas en el modelo base. La cuantizacion se realizo con herramientas estandar de ONNX y se valido en tres escenas (retrato con fondo profundo, interior a media distancia e interior a corta distancia), manteniendo la estructura de profundidad en el tercio lejano del encuadre.

## Capacidades

- Estimacion de profundidad monocular: genera mapas de profundidad a partir de una unica imagen, indicando la distancia relativa de cada pixel a la camara.
- Inferencia en tiempo real en navegador: gracias a la cuantizacion a 8 bits y al formato ONNX, se puede ejecutar via Transformers.js en WebAssembly o WebGPU, alcanzando latencias de 90-113 ms a resolucion de 322 píxeles.
- Compatibilidad con resoluciones dinamicas: el modelo acepta entradas de tamano variable, lo que permite ajustar la resolucion segun las necesidades de la aplicacion.
- Generalizacion a escenas diversas: las pruebas del autor cubren retratos, interiores y escenas con fondo profundo, mostrando robustez en distintos rangos de distancia.
- Integracion sencilla en proyectos web: al ser un export ONNX, se puede cargar con ONNX Runtime Web o Transformers.js sin necesidad de convertir pesos adicionalmente.
- Licencia permisiva Apache-2.0: permite uso comercial, modificacion y redistribucion sin restricciones significativas.

## Casos de uso

- Visor de profundidad en tiempo real en el navegador: el proposito original del modelo. Se integra en `depth-realtime` para mostrar mapas de profundidad en vivo desde una webcam, con una latencia aceptable para interaccion fluida.
- Realidad aumentada web: aplicaciones que necesitan conocer la profundidad de la escena para colocar objetos virtuales de forma coherente, sin requerir instalacion de aplicaciones nativas.
- Fotografia computacional: estimacion de profundidad para efectos de desenfoque de fondo (bokeh) o separacion de sujeto en editores de imagen online.
- Robotica educativa: uso en proyectos de robotica que requieren percepcion de profundidad basica y que se ejecutan en dispositivos de bajo consumo como Raspberry Pi o navegadores en tablets.
- Analisis de escenas para accesibilidad: herramientas que ayudan a personas con discapacidad visual a comprender la distancia de los objetos, ejecutandose en dispositivos moviles via web.
- Prototipado rapido de sistemas de vision: al ser un modelo pequeno y rapido, permite validar algoritmos de navegacion o evitacion de obstaculos en entornos simulados o con hardware modesto.
- Segmentacion de objetos por profundidad: combinado con un detector de objetos, se puede separar el primer plano del fondo en aplicaciones de videoconferencia o transmision en directo.

## Benchmarks y rendimiento

El autor proporciona mediciones de fidelidad y tiempo de inferencia comparando la version cuantizada con la float32 original, a 322 píxeles de entrada:

| Escena | Pearson r | Tiempo float32 | Tiempo 8-bit |
| --- | --- | --- | --- |
| Retrato, fondo profundo | 0,9977 | 218 ms | 101 ms |
| Interior, media distancia | 0,9902 | 171 ms | 113 ms |
| Interior, corta distancia | 0,9984 | 127 ms | 90 ms |

Ademas, se evaluo el numero de niveles de profundidad distintos que sobreviven en el tercio lejano del encuadre tras la normalizacion percentil y el transporte a 8 bits: 179 → 177, 84 → 91 y 50 → 53, lo que indica que la cuantizacion no destruye la estructura del fondo. No se han publicado resultados en benchmarks estandar de estimacion de profundidad (como KITTI o NYU Depth V2) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 28,9 MB en ONNX, la memoria necesaria es inferior a 100 MB en runtime, tanto en CPU como en GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con tiempos de 90-113 ms. Si se usa WebGPU en el navegador, la latencia puede mejorar, aunque no hay datos publicados.
- Compatibilidad con hardware de consumo: puede ejecutarse en cualquier ordenador moderno, incluso en portatiles de gama media, y en moviles con soporte de WebAssembly.
- Opciones de despliegue: Transformers.js (navegador), ONNX Runtime Web, ONNX Runtime local (Python/C++), o cualquier runtime compatible con ONNX.
- Latencia y throughput: los tiempos medidos son de 90-113 ms por imagen a 322 píxeles en un entorno no especificado; para resoluciones mayores se espera un aumento proporcional.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de estimacion de profundidad en la informacion proporcionada. El modelo base Depth Anything V3 se posiciona como sucesor de Depth Anything V2, pero no se incluyen resultados de benchmarks comparativos. Se puede mencionar que existen alternativas como MiDaS o ZoeDepth, pero sin datos cuantitativos no es posible realizar una comparativa rigurosa. Por tanto, esta seccion se considera no disponible.

## Limitaciones y advertencias

- La cuantizacion a 8 bits puede degradar la precision en escenas con detalles finos o bordes abruptos, aunque las pruebas del autor muestran una correlacion superior a 0,99 en los casos evaluados.
- No se ha evaluado el rendimiento en condiciones de poca iluminacion, niebla, superficies reflectantes o texturas repetitivas, donde los modelos de profundidad suelen fallar.
- Al ser una version ONNX, no se incluyen los pesos originales de PyTorch; si se necesita el modelo completo, hay que acudir al repositorio base.
- La informacion sobre el modelo base (parametros, dataset, arquitectura exacta) no esta disponible en la model card; se recomienda consultar el repositorio oficial de Depth Anything 3 para detalles tecnicos.
- El uso en produccion requiere validar el modelo en el dominio especifico, ya que la generalizacion a escenarios no representados en las pruebas puede ser limitada.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el modelo base no tenga restricciones adicionales (aunque el repositorio de ByteDance tambien usa Apache-2.0).

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/en970/depth-anything-v3-small-onnx
- Repositorio del visor depth-realtime: https://github.com/en970/depth-realtime
- Repositorio oficial de Depth Anything 3 (ByteDance): https://github.com/ByteDance-Seed/Depth-Anything-3
- Pagina del proyecto Depth Anything 3: https://depth-anything-3.github.io/
- Repositorio ONNX de Depth Anything 3 (devin-lai): https://github.com/devin-lai/Depth-Anything-3-Onnx
