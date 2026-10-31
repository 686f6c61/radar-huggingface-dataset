# osfv/talus

## Resumen

Talus es un modelo de difusion condicional desarrollado por el equipo de osfv que genera mapas de altura (heightmaps) de terreno para videojuegos. A diferencia de los generadores procedurales clasicos basados en ruido, Talus es una red neuronal de 23 millones de parametros entrenada desde cero sobre 45.000 mapas procedurales, capaz de producir mapas de 64x64 celdas que cubren 4 x 4 km con elevaciones de hasta 1.200 metros.

El problema que resuelve es la generacion rapida y controlable de terrenos verosimiles en flujos de trabajo de desarrollo de juegos (gamedev). El usuario elige un tipo de terreno (llanuras, islas, mesetas, colinas, montanas o crestas) y hasta cinco propiedades medibles (elevacion media, relieve, pendiente, cobertura de agua y rugosidad), y el modelo genera un mapa coherente con esas condiciones. Existen dos variantes: Talus-3 (la predeterminada, mejor para montanas y crestas) y Talus-3.1 (optimizada para terrenos llanos como llanuras, islas y mesetas).

Su relevancia actual radica en que es un modelo de difusion ligero y de dominio especifico: funciona en una GPU de consumo de 8 GB, incluso en CPU, y se ejecuta directamente en el navegador via WebGPU gracias a su exportacion a ONNX. El proyecto publica codigo, pesos y un protocolo de benchmarks detallado bajo licencia Apache-2.0, lo que lo hace totalmente apto para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net en espacio de pixeles (difusion, v-prediction, schedule de ruido coseno) |
| Parametros totales | 23 M |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos en inferencia) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | fp32 y fp16 (pesos ONNX); pesos PyTorch en fp32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | PyTorch (.pt, 93 MB) y ONNX (fp32: 93 MB, fp16: 47 MB) |

## Arquitectura y entrenamiento

Talus emplea un denoisador U-Net que opera directamente en el espacio de pixeles de la heightmap, con prediccion tipo v y un schedule de ruido coseno. El modelo esta condicionado por el tipo de terreno y las cinco propiedades fisicas medibles. Durante el entrenamiento se descarta aleatoriamente cada propiedad (dropout de condicion), de modo que el modelo aprende a generar con cualquier subconjunto de condiciones; en el muestreo se aplica classifier-free guidance con guidance 2.0 para reforzar el control. El preset de muestreo por defecto usa 50 pasos DDIM con espaciado cuadratico, almacenado en el propio checkpoint.

El dataset de entrenamiento procede de un generador procedural propio que construye cada mapa a partir de ruido fBm, billow o ridged multifractal, y despues aplica simulaciones de erosion stream-power, difusion de laderas y erosion termica. Consta de 50.000 mapas divididos en 45.000 de entrenamiento, 2.500 de validacion y 2.500 de test. La variante Talus-3.1 se obtuvo continuando el entrenamiento sobre 96.000 mapas nuevos del mismo generador, orientados a terrenos llanos.

## Capacidades

- Generacion de heightmaps de 64x64 celdas (escala 4 x 4 km, alturas hasta 1.200 m) mediante difusion condicional.
- Control por tipo de terreno: llanuras, islas, mesetas, colinas, montanas y crestas.
- Control por cinco propiedades medibles: elevacion media, relieve, pendiente, cobertura de agua y rugosidad (spectral_beta).
- Generacion sin condicion completa: si se dejan abiertas la elevacion media o el relieve, el sampler usa un banco de colocacion (prior) incluido en el repo.
- Exportacion a formatos de gamedev: PNG (16 bits), Unity RAW (r16) y OBJ, con soporte para Unity, Unreal y Godot.
- Ejecucion en navegador via WebGPU usando la version ONNX fp16, o en CPU.
- Procesamiento por lotes: alrededor de 5,6-5,8 mapas por segundo a batch 128 en una RTX 5060.

## Casos de uso

- Prototipado rapido de niveles en gamedev: un disenador puede generar decenas de mapas de islas con un 60 % de agua en segundos y elegir el que mejor encaje en el diseno del nivel.
- Generacion masiva de terrenos para mundos abiertos: el soporte de batch (16 mapas con un solo comando via CLI) permite poblar grandes extensiones de mapa con terreno variado y reproducible.
- Herramienta in-browser para equipos de diseno: la demo WebGPU permite a artistas y disenadores sin entorno Python generar y exportar mapas directamente desde el navegador.
- Integracion en pipelines de Unity, Unreal o Godot: la exportacion a Unity RAW y OBJ permite incorporar los heightmaps directamente como terrain assets en el motor.
- Base para terreno de alta resolucion: la salida de 64x64 puede usarse como capa base sobre la que aplicar ruido de detalle o upscaling para alcanzar resoluciones jugables.
- Generacion condicional de biomas especificos: pedir mesetas o crestas con propiedades concretas de pendiente y relieve para disenos de niveles con requisitos mecanicos concretos.
- Investigacion en generacion procedural neuronal: el codigo de entrenamiento, el dataset sintetico y el protocolo de benchmarks publicados lo hacen util como referencia reproducible en generacion procedural asistida por redes neuronales.

## Benchmarks y rendimiento

Puntuaciones en el split de test (1.000 mapas por mitad). Cada puntuacion va de 0 a 100, donde 100 significa indistinguible del terreno procedural real a ese tamano de muestra:

| Benchmark | Que mide | Talus-1 | Talus-2 | Talus-3 | Talus-3.1 |
|---|---|---|---|---|---|
| Realism | 25 metricas de terreno vs mapas reales | 34,4 | 56,5 | 66,2 | 64,5 |
| Spectrum | detalle a todas las escalas (espectro de potencia) | 3,6 | 7,6 | 11,0 | 11,3 |
| Heights | distribucion de elevacion | 88,5 | 98,3 | 99,1 | 98,3 |
| Slopes | distribucion de pendientes | 41,2 | 56,4 | 60,5 | 59,0 |
| Control | propiedades pedidas vs medidas | 81,8 | 90,4 | 92,1 | 92,4 |
| Playability | tasa de rutas transitables vs mapas reales | 98,4 | 97,6 | 99,9 | 99,3 |
| Diversity | variedad vs mapas reales | 96,9 | 94,4 | 95,0 | 94,6 |
| Originality | distancia respecto a los mapas de entrenamiento | 100 | 98,1 | 99,1 | 98,4 |
| Clean detail | ausencia de micro-relieve excesivo | 58,4 | 97,7 | 99,4 | 99,5 |
| Media | | 67,0 | 77,5 | 80,3 | 79,7 |

Realismo por tipo de terreno en test (distancia a los mapas reales sobre el suelo de ruido; menor es mejor):

| | llanuras | islas | mesetas | colinas | montanas | crestas |
|---|---|---|---|---|---|---|
| Talus-3 | 1,17 | 1,21 | 1,43 | 1,16 | 1,71 | 1,80 |
| Talus-3.1 | 1,13 | 1,16 | 1,33 | 1,20 | 1,75 | 1,93 |

Rendimiento de inferencia: ambos modelos muestrean a unos 5,6-5,8 mapas por segundo a batch 128 en una RTX 5060 (8 GB), lo que equivale a un mapa por cada 1,3 segundos aproximadamente.

## Requisitos de hardware

- VRAM estimada: cabe comodamente en una GPU de consumo de 8 GB (verificado en RTX 5060); el modelo de 23 M de parametros en fp16 ocupa solo 47 MB de pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA y PyTorch 2.7+; para tarjetas RTX de serie 50 se requiere una build de PyTorch con CUDA 12.8. Tambien funciona en CPU (unos pocos segundos por mapa).
- Consumer GPUs: si, esta disenado para ello; una RTX 5060 de 8 GB alcanza 5,6-5,8 mapas/s a batch 128. Tambien funciona sin GPU via WebGPU o CPU en navegador.
- Opciones de despliegue: CLI propia (`nullscape sample`) del repositorio de GitHub, demo web con WebGPU, y pesos ONNX (fp32 y fp16) para integracion en entornos propios. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable, al no ser un modelo de lenguaje).
- Latencia: aproximadamente 1,3 segundos por mapa en RTX 5060; en CPU, unos pocos segundos por mapa segun el autor.

## Comparativa con modelos similares

No existen en la ficha comparativas directas con otros modelos neuronales de generacion de heightmaps. Como referencia de categoria, se comparan las dos variantes publicadas y el enfoque procedural clasico:

| | Talus-3 | Talus-3.1 | Generador procedural clasico (fBm + erosion) |
|---|---|---|---|
| Parametros | 23 M | 23 M | no aplicable (algoritmo determinista/parametrico) |
| Salida | heightmap 64x64, 4 x 4 km, hasta 1.200 m | heightmap 64x64, 4 x 4 km, hasta 1.200 m | variable segun implementacion |
| Control | tipo de terreno + 5 propiedades medibles | tipo de terreno + 5 propiedades medibles | parametros de ruido y erosion, sin garantia de propiedades medibles |
| Realismo (benchmark propio) | 66,2 (media global 80,3) | 64,5 (media global 79,7) | 100 por definicion (es la referencia del benchmark) |
| Licencia | Apache-2.0 | Apache-2.0 | variable |
| Disponibilidad | pesos, codigo y demo web publicados | pesos, codigo y demo web publicados | multiplesciones open source (ej. herramientas tipo World Machine, no comparadas aqui) |

Cabe senalar que el benchmark de realismo mide la distancia respecto al terreno procedural real del propio generador de entrenamiento, no respecto de datos de elevacion reales del mundo fisico, por lo que la comparacion con otros enfoques fuera de este protocolo no esta disponible.

## Limitaciones y advertencias

- Talus solo conoce el mundo procedural en el que fue entrenado: nunca ha visto datos de elevacion reales, por lo que sus terrenos no reproducen geografia fisica real.
- La resolucion de 64x64 celdas a 64 m por celda es gruesa para juego en primera persona o vistas cercanas; la salida debe tratarse como capa base para ruido de detalle o upscaling.
- Las montanas y crestas son los tipos mas debiles, y el espectro de potencia sigue estando 9 veces por encima del suelo de ruido, sobre todo en las escalas mas finas.
- El control de rugosidad (spectral_beta) es la mas imprecisa de las cinco propiedades condicionales.
- Talus-3.1 mejora llanuras, islas y mesetas pero empeora crestas y montanas; conviene elegir la variante segun el tipo de terreno objetivo.
- Riesgo de alucinacion: no aplicable en el sentido de LLMs, pero el modelo puede producir terrenos que no cumplan exactamente las propiedades pedidas (puntuacion de control de 92,1/100).
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial; se debe incluir el aviso de licencia correspondiente.
- El muestreo en PyTorch requiere el paquete `nullscape` del repositorio de GitHub, no distribuido en PyPI segun la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/osfv/talus
- Demo en navegador (WebGPU/CPU): https://talus.tersa.tech/
- Codigo, entrenamiento y benchmarks en GitHub: https://github.com/osfv/talus
- Scorecards completos y protocolo de benchmark: https://github.com/osfv/talus/tree/master/docs
