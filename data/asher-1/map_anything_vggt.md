# Asher-1/map_anything_vggt

## Resumen

`Asher-1/map_anything_vggt` es un repositorio de Hugging Face que distribuye pesos en formato GGUF del modelo VGGT (Visual Geometry Grounded Transformer), concretamente la variante `vggt-1b` del proyecto MapAnything, un ecosistema de reconstruccion 3D y estimacion de geometria a partir de imagenes. El autor del repositorio, Asher-1, mantiene el proyecto `map-anything-ggml`, un runtime en C++/GGML que permite ejecutar seis arquitecturas de reconstruccion (vggt-omega, pi3x, mapanything, pi3, vggt-1b y dust3r) sobre CPU, CUDA y Vulkan sin depender de PyTorch.

VGGT no es un modelo de lenguaje: es un transformer de vision que, dada una o varias imagenes de una escena, produce mapas de puntos (pointmaps), mapas de profundidad, poses de camara y escala metrica. El modelo `vggt-1b` es la variante de 1.000 millones de parametros de la familia VGGT, pensada para reconstruccion de escenas con un numero variable de vistas (N-view). El repositorio incluye los pesos convertidos a GGUF en varias precisiones (f32, f16, q8_0 y una K-quant medida), lo que permite desplegar el modelo en hardware modesto.

La relevancia actual del repositorio radica en que lleva un modelo de reconstruccion 3D de ultima generacion a un runtime portable y cuantizado, con paridad numerica verificada frente a PyTorch y aceleraciones de hasta 1,7x en CUDA. Para desarrolladores que necesitan integrar reconstruccion 3D en pipelines sin GPU de datacenter, es una alternativa practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (VGGT, N-view), no generativo de texto |
| Parametros totales | 571.170.440 (safetensors reportados); la variante vggt-1b se describe como ~1B en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa un numero variable de vistas, 2-100 segun la model card) |
| Tipos de cuantizacion | f32, f16, q8_0, q6_K (vggt-1b usa q5_K como K-quant medida) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (runtime C++/GGML); checkpoints PyTorch `.pt` para conversion |

## Arquitectura y entrenamiento

VGGT (Visual Geometry Grounded Transformer) es un transformer de vision disenado para inferir geometria 3D a partir de un conjunto de imagenes. A diferencia de los enfoques clasicos de structure-from-motion o multi-view stereo, VGGT procesa todas las vistas de forma conjunta mediante atencion y predice directamente mapas de puntos, profundidad y poses de camara en una sola pasada. La variante `vggt-1b` corresponde al checkpoint de aproximadamente 1.000 millones de parametros publicado por el equipo de VGGT (referenciado en la model card como `facebook/VGGT-Omega` para la variante omega).

El repositorio no documenta el dataset de entrenamiento, el numero de tokens de imagen ni si hubo etapas de ajuste fino con RLHF o preferencias (no aplicable en un modelo de vision). La innovacion tecnica destacable no esta en el entrenamiento sino en la implementacion: el proyecto `map-anything-ggml` reimplementa el forward pass en C++ sobre GGML, con soporte para CUDA, Vulkan y CPU, y valida la paridad numerica frente a PyTorch f32 mediante una matriz de compuertas (gate) cuantizacion x backend. Para vggt-1b, la model card reporta 15/15 compuertas superadas.

## Capacidades

- Reconstruccion 3D de escenas a partir de 2 a 100 vistas (N-view) en una sola pasada.
- Estimacion de mapas de puntos (pointmaps) por pixel.
- Estimacion de profundidad densa (depth maps).
- Estimacion de poses de camara (rotacion y traslacion) con metricas ATE y AUC.
- Estimacion de escala metrica en las variantes que la soportan (mapanything, pi3x).
- Procesamiento por pares de imagenes en el ancestro dust3r (S=2, sin cabeza de pose).
- Ejecucion en CPU, CUDA y Vulkan mediante el runtime GGML.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Reconstruccion 3D de interiores y exteriores: el modelo procesa entre 2 y 100 vistas de una escena y devuelve pointmaps y profundidad; es adecuado para digitalizacion de espacios con drones o camaras moviles.
- Estimacion de poses de camara para fotogrametria: sustituye pipelines clasicos de SfM en escenarios donde se necesita una estimacion rapida (latencia de ~70 ms en RTX 4090 con q8_0) de la trayectoria de la camara.
- Generacion de nubes de puntos para gemelos digitales: los pointmaps por pixel permiten construir nubes densas que alimentan herramientas de modelado BIM o CAD.
- Robotica y navegacion: la estimacion de profundidad y pose en tiempo casi real (76 ms en f16 sobre CUDA) permite integrar el modelo en bucles de percepcion de robots moviles.
- Realidad aumentada: la escala metrica de las variantes mapanything y pi3x (metric_scale 0.162 y 0.251 respectivamente) facilita anclar objetos virtuales con dimensiones fisicas correctas.
- Despliegue en hardware sin GPU: con `--backend cpu` y cuantizacion q8_0, el modelo omega-512 se ejecuta en 12,3 s, lo que permite procesamiento por lotes en servidores sin acelerador.
- Investigacion en reconstruccion multi-vista: la disponibilidad de seis arquitecturas y 32 ficheros GGUF con paridad verificada permite comparar paradigmas (pair-wise, N-view, unified) con el mismo runtime.

## Benchmarks y rendimiento

Datos de la model card para el protocolo oficial MapAnything ETH3D (130 conjuntos, semilla 777, 2 vistas, comparacion bilateral contra PyTorch; menor es mejor):

| Metrica | PyTorch f32 | f16 | q8_0 | q6_K | Referencia oficial |
|---|---|---|---|---|---|
| Pose AUC@5 up (x100) | 79,23 | 79,08 | 77,08 | 76,46 | 79,53 |
| Pose ATE RMSE down | 0,00655 | 0,00662 | 0,00648 | 0,00644 | 0,00999 |
| Depth AbsRel down | 0,0208 | 0,0209 | 0,0210 | 0,0207 | 0,0204 |
| Point AbsRel down | 0,0302 | 0,0302 | 0,0305 | 0,0302 | 0,0263 |

Latencia en RTX 4090 (512x512x2, inferencia pura en estado estacionario):

| Formato | PyTorch f32 | f32 | f16 | q8_0 | q6_K |
|---|---|---|---|---|---|
| CUDA | 65,0 ms | 109,0 ms | 76,2 ms | 70,7 ms | 75,5 ms |
| Vulkan | no disponible | no disponible | 94,7 ms | 97,3 ms | 101,5 ms |
| CPU | no disponible | 18,68 s | 17,8 s | 12,3 s | no disponible |

Comparativa entre las seis arquitecturas del proyecto (protocolo ETH3D, menor es mejor):

| Modelo | pointmaps | depth | ATE | rot (grados) | metric scale | Velocidad vs torch |
|---|---|---|---|---|---|---|
| vggt-omega | 0,0302 | 0,0208 | 0,0065 | 0,56 | 0,762 | 0,85x |
| pi3x | 0,0533 | 0,0369 | 0,0162 | 2,11 | 0,251 | 1,43-1,48x |
| mapanything | 0,0553 | 0,0469 | 0,0124 | 0,92 | 0,162 | 1,79-2,28x |
| pi3 | 0,0650 | 0,0485 | 0,0172 | 1,82 | 0,733 | ~1,0x |
| vggt-1b | 0,0674 | 0,0541 | 0,0208 | 2,28 | 0,788 | 1,60-1,69x |
| dust3r | 0,1008 | 0,1033 | 0,0509 | 2,77 | 0,897 | 2,02-2,06x |

## Requisitos de hardware

- VRAM estimada para vggt-1b: aproximadamente 4,4 GB en f32, 2,2 GB en f16, 1,3 GB en q8_0 y ~1,1 GB en q5_K/q6_K (tamanos de fichero GGUF reportados para la variante omega; vggt-1b es de tamano similar).
- GPU recomendadas: RTX 4090 para las latencias reportadas; A100/H100 no documentadas en la model card, pero el runtime CUDA es compatible con cualquier GPU NVIDIA con soporte de CUDA.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM para f16, y en tarjetas con 2-4 GB para cuantizaciones q8_0/q6_K.
- Opciones de despliegue: runtime propio `map-anything-ggml` en C++ (backends CUDA, Vulkan y CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: 70,7 ms por inferencia de 2 vistas 512x512 en CUDA q8_0 sobre RTX 4090; 12,3 s en CPU q8_0. El throughput depende del numero de vistas y de la resolucion de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (vistas) | Point AbsRel (ETH3D) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vggt-1b (este repo) | ~1B | 2-100 | 0,0674 | no disponible | GGUF en HF + runtime C++ |
| vggt-omega | ~1B | 2-100 | 0,0302 | no disponible | GGUF en HF + runtime C++ |
| mapanything | no disponible | N-view | 0,0553 | no disponible | GGUF en HF + runtime C++ |
| dust3r | no disponible | 2 (pair-wise) | 0,1008 | no disponible | GGUF en HF + runtime C++ |

Las seis arquitecturas comparadas pertenecen al mismo ecosistema y comparten runtime, por lo que la comparativa con alternativas externas (DUSt3R original, MASt3R, VGGT oficial en PyTorch) no esta documentada en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- Licencia no especificada en el repositorio: no se puede confirmar el uso comercial sin consultar el proyecto original de VGGT y MapAnything.
- La model card esta mayoritariamente en ingles y orientada al runtime C++; la documentacion de sesgos y limitaciones del modelo original no se reproduce.
- Riesgo de error en escenas con poca textura, superficies reflectantes o movimiento: inherente a los metodos de reconstruccion multi-vista, aunque no se cuantifica en la informacion disponible.
- La variante vggt-1b es menos precisa que vggt-omega y mapanything en todas las metricas ETH3D reportadas (pointmaps 0,0674 frente a 0,0302 y 0,0553).
- El numero de parametros reportado en safetensors (571 M) no coincide con la denominacion "1b" de la model card; conviene verificar el checkpoint concreto antes de desplegar.
- El repositorio ocupa 80,7 GB, lo que implica un coste de almacenamiento y descarga considerable para incluir todos los formatos y arquitecturas.
- Dependencia de un runtime propio en C++: no hay integracion con ecosistemas estandar de inferencia, lo que limita la portabilidad a otros stacks.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Asher-1/map_anything_vggt
- Repositorio GitHub del runtime: https://github.com/Asher-1/map-anything-ggml
- Graficas de benchmarks (rama main): https://github.com/Asher-1/map-anything-ggml/raw/main/cpp_ggml/benchmarks/charts/
- Checkpoint oficial VGGT-Omega referenciado: `facebook/VGGT-Omega` (no se proporciona URL directa en la informacion disponible)
- Paper de VGGT: no disponible en la informacion proporcionada
