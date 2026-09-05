# cgb/triposr-onnx-webgpu

## Resumen

TripoSR es un modelo de reconstruccion 3D a partir de una sola imagen desarrollado por Stability AI. Esta variante, creada por cgb, exporta el modelo a formato ONNX para que pueda ejecutarse integramente en el navegador mediante WebGPU, sin necesidad de servidor ni API key. Resuelve el problema de generar una malla 3D a partir de una fotografia de forma privada y sin infraestructura. La arquitectura combina un encoder DINO ViT-B/16 con un decoder de triplane. Los pesos se distribuyen en dos grafos ONNX: uno que genera el triplane (485 MB en int8) y otro que decodifica densidad y color (0.2 MB en float32). No es un modelo de lenguaje, por lo que no aplica longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder DINO ViT-B/16 y decoder de triplane |
| Parametros totales | no disponible (los pesos int8 del triplane ocupan 485 MB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de reconstruccion 3D a partir de imagen) |
| Tipos de cuantizacion | int8 weight-only block 32 (triplane) y float32 (decoder) |
| Idiomas soportados | no aplica |
| Licencia | MIT (con componentes Apache-2.0 para el encoder DINO) |
| Formato de pesos | ONNX (archivos .onnx y .data) |

## Arquitectura y entrenamiento

TripoSR es un modelo de reconstruccion 3D que utiliza un encoder DINO ViT-B/16 para extraer caracteristicas de una imagen y un decoder de triplane para generar una representacion volumetrica. En esta exportacion ONNX, el encoder y la generacion del triplane se encuentran en el grafo `triplane.onnx`, mientras que el decoder se ha separado en `decoder.onnx`. Ambos grafos se ejecutan en el navegador mediante onnxruntime-web con el proveedor de ejecucion WebGPU.

Una innovacion destacable es el plegado de las activaciones del renderer dentro del decoder, de modo que devuelve densidad ya transformada (`exp(raw + bias)`) y color a traves de una sigmoide, evitando que el caller tenga que aplicar transformaciones adicionales. El paso de `grid_sample` que convierte un punto 3D en 120 caracteristicas se ha omitido deliberadamente de los grafos debido a la cobertura irregular de GridSample en el backend WebGPU, y se implementa en el codigo del caller. Los datos de entrenamiento del modelo original no estan disponibles en la informacion proporcionada.

## Capacidades

- Reconstruccion de una malla 3D a partir de una unica imagen RGB de 512x512.
- Ejecucion completamente en el navegador, sin servidor ni envio de datos a un backend.
- Generacion de un triplane de dimensiones [1, 3, 40, 64, 64] y posterior muestreo para obtener densidad y color por puntos.
- Cuantizacion int8 weight-only con block size 32, disenada para preservar la fidelidad de la superficie en lugar de solo la similitud de coseno.
- No soporta tool calling, agentes ni generacion de texto, al ser un modelo especifico de vision 3D.

## Casos de uso

- Visualizacion de productos en e-commerce: el modelo permite convertir fotografias de productos en modelos 3D interactivos que el cliente puede rotar y examinar desde cualquier angulo directamente en el navegador, sin coste de servidor.
- Creacion de assets 3D para juegos: los desarrolladores pueden generar rapidamente mallas de referencia a partir de fotos de objetos reales, acelerando el prototipado de niveles y la creacion de contenido.
- Arquitectura y diseno de interiores: a partir de una foto de una habitacion o un mueble, se puede obtener un modelo 3D para integrarlo en herramientas de planificacion de espacios y visualizacion de reformas.
- Educacion y museos virtuales: la reconstruccion de piezas arqueologicas o especimenes a partir de fotografias permite crear recorridos 3D accesibles desde cualquier dispositivo con WebGPU, sin necesidad de infraestructura de renderizado.
- Prototipado rapido en fabricacion: los ingenieros pueden digitalizar piezas existentes a partir de una fotografia y exportar la malla para inspeccion o para uso en software CAD, reduciendo el tiempo de modelado manual.
- Realidad aumentada en el navegador: al generar modelos 3D al instante, se pueden superponer objetos virtuales sobre la camara del dispositivo en una experiencia AR ligera, sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval o GSM8K) en la informacion disponible. La model card incluye una verificacion interna comparativa contra la referencia PyTorch:

| Metrica | Resultado |
|---|---|
| Similitud coseno en triplane (fp32) | 1.000000 |
| Similitud coseno en triplane (int8) | 0.9998 |
| Acuerdo de ocupacion (block 128) | 96.6% |
| Acuerdo de ocupacion (block 32) | 99.1% |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Los pesos del triplane en int8 ocupan 485 MB, por lo que se necesita una GPU con al menos 1 GB de VRAM para buffers de ejecucion y el decoder.
- GPU recomendadas: cualquier GPU compatible con WebGPU, incluidas las integradas de Intel y las dedicadas de NVIDIA o AMD. Navegadores compatibles: Chrome, Edge y otros con soporte WebGPU.
- No se recomienda desplegar con vLLM, llama.cpp, Ollama o TGI, ya que el modelo esta disenado para ejecutarse en onnxruntime-web en el navegador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Precision | Tamano | Ejecucion | Licencia |
|---|---|---|---|---|
| cgb/triposr-onnx-webgpu | int8 weight-only block 32 + float32 decoder | 485 MB + 0.2 MB | Navegador WebGPU | MIT |
| dcharlot65-aurasense/triposr-onnx-web | fp16 | no disponible | Navegador WebGPU | no disponible |
| stabilityai/TripoSR (original) | fp32 | no disponible | PyTorch / servidor | MIT |

La version de cgb utiliza int8 en lugar de fp16, sacrificando algo de precision en favor de un menor tamano, y emplea block size 32 para mejorar el acuerdo de ocupacion. El modelo original requiere ejecucion en servidor, mientras que esta variante se ejecuta en el navegador.

## Limitaciones y advertencias

- La preparacion de la imagen es critica: el sujeto debe estar recortado, enmarcado al 85% del ancho y compuesto sobre un fondo gris medio. Usar fondo blanco o no ajustar el encuadre puede producir geometria fantasma o proporciones incorrectas.
- Dependencia de WebGPU, que no esta disponible en todos los navegadores ni en todas las GPU, especialmente en versiones antiguas de Safari o Firefox.
- El paso de `grid_sample` se implementa en el caller, lo que requiere codigo adicional y puede introducir errores si no se replica exactamente el comportamiento de `align_corners=false`.
- Riesgo de alucinacion geometrica en zonas no visibles de la imagen, especialmente si el sujeto tiene superficies brillantes o reflejos.
- La licencia MIT permite uso comercial, pero el encoder DINO ViT-B/16 incluido en el grafo esta bajo Apache-2.0, que tambien permite uso comercial con atribucion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/cgb/triposr-onnx-webgpu
- Demo en linea: https://freegen.ai
- Modelo base original: https://huggingface.co/stabilityai/TripoSR
- Modelo similar (fp16): https://huggingface.co/dcharlot65-aurasense/triposr-onnx-web
