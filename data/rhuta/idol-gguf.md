# rhuta/Idol-GGUF

## Resumen

Idol-GGUF es una compilación cuantizada a 8 bits del modelo Idol de SperiD Labs, un sistema de reconstrucción 3D a partir de una única imagen. Idol genera una nube de puntos gaussianos tridimensional (Gaussian splatting) a partir de una entrada visual, lo que permite obtener representaciones 3D densas y renderizables sin necesidad de múltiples vistas. Esta versión GGUF, publicada por el usuario rhuta, empaqueta los cuatro componentes del modelo original (denoiser, decodificador de octree, decodificador gaussiano y eliminador de fondo) en un único archivo de 967 MB ejecutable mediante el runtime idol.cpp.

El modelo cuenta con 879.302.053 parámetros totales y se distribuye bajo licencia Apache 2.0. Es relevante porque reduce los requisitos de memoria del Idol original manteniendo una fidelidad geométrica muy alta: en una cohorte de 32 objetos, la distancia media de malla respecto al modelo original es del 0,124 % de la diagonal del bounding box. La cuantización mixta emplea bloques Q8_0 con calibración por covarianza en las matrices elegibles del denoiser, lo que la distingue del redondeo Q8_0 plano.

No obstante, el archivo no es autosuficiente: requiere dos codificadores de imagen externos (DINOv3 y el autoencoder de FLUX.2-dev) que están sujetos a sus propias licencias y condiciones de acceso. Además, Idol no procesa texto; para generar imágenes de entrada hace falta un generador configurado aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de reconstruccion 3D con denoiser, decodificador de octree, decodificador gaussiano y eliminador de fondo (Gaussian splatting) |
| Parametros totales | 879.302.053 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a 3D, no textual) |
| Tipos de cuantizacion | Q8_0 mixta (422 tensores Q8_0, 125 float16, 1.076 float32, 67 int64) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Idol-Q8_0.gguf`, 967.253.440 bytes) |

## Arquitectura y entrenamiento

Idol es un pipeline de reconstruccion de objetos 3D a partir de una sola imagen que produce nubes de puntos gaussianos. El archivo GGUF integra cuatro submodelos: un denoiser, un decodificador de octree, un decodificador gaussiano y un eliminador de fondo. Las matrices elegibles del denoiser emplean codigos calibrados por covarianza dentro de bloques de ocho bits, mientras que el resto de matrices elegibles usan redondeo Q8_0 convencional; por ello la etiqueta "8-bit" no implica precision uniforme en todos los tensores.

El modelo depende de dos codificadores de imagen externos que no se incluyen en este repositorio: DINOv3 (en su version original de precision) y el autoencoder de FLUX.2-dev. Ambos estan sujetos a sus propias condiciones de acceso y licencias. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Reconstruccion de nubes de puntos gaussianos 3D a partir de una unica imagen de entrada.
- Extraccion de malla (mesh) sin texturizar mediante la interfaz de idol.cpp.
- Generacion de representaciones 3D renderizables con hasta 262.144 gaussianos en las pruebas documentadas.
- Eliminacion de fondo integrada como componente del pipeline.
- Ejecucion mediante servidor local con interfaz de navegador, linea de comandos e interfaz HTTP.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No procesa texto ni mantiene conversaciones; la entrada es exclusivamente visual.

## Casos de uso

- Digitalizacion de objetos para catalogos de comercio electronico: a partir de una foto de producto se obtiene una malla 3D que puede visualizarse en un visor web, aprovechando la fidelidad geometrica documentada (0,124 % de distancia media de malla).
- Creacion de assets para videojuegos y realidad aumentada: el modelo genera nubes gaussianas y mallas que sirven como base para modelado posterior, con la ventaja de requerir una sola imagen en lugar de un escaneo multivista.
- Prototipado rapido en diseno industrial: convertir bocetos o fotografias de maquetas en representaciones 3D para revision temprana, ejecutando el modelo en local gracias a su tamano de 967 MB.
- Investigacion en vision 3D: el runtime idol.cpp permite reproducir experimentos de image-to-3D con un archivo unico y comparar resultados frente al modelo original, con protocolo de benchmark documentado.
- Despliegue en entornos con memoria limitada: el modo "lean" mantiene los modelos en disco y permite completar generaciones en contenedores con 4 GB de RAM, alli donde el modo por etapas falla.
- Generacion de contenido 3D asistida por texto: combinando Idol con un generador de imagenes configurado aparte (por ejemplo, Iris-3B con Qwen3-VL-4B para codificacion de texto) se puede pasar de una descripcion textual a una imagen y de ahi a una reconstruccion 3D.

## Benchmarks y rendimiento

Los datos disponibles miden la concordancia con el Idol original, no la precision 3D frente a verdad de referencia. Cohorte fija de 32 objetos domesticos con tres semillas emparejadas (96 comparaciones), codificadores en precision original, 50 pasos y 262.144 gaussianos:

| Medicion | Media | Mediana | Peor caso observado |
|---|---:|---:|---:|
| Distancia media de malla / diagonal del bounding box original | 0,124 % | 0,089 % | 1,715 % |
| F1 de malla dentro del 0,1 % de la diagonal | 68,49 % | 71,51 % | 5,24 % |
| F1 de malla dentro del 0,5 % de la diagonal | 96,74 % | 98,92 % | 24,78 % |
| Error de color de primer plano en vista aproximada | 2,22 % | 1,68 % | 28,59 % |
| Interseccion sobre union de silueta en vista aproximada | 98,63 % | 99,38 % | 64,70 % |

El peor caso documentado es Lego Friends Mia con semilla 2026. Una sonda post-hoc midio 1,715 % de distancia media de malla en la repeticion fusionada, 1,395 % reutilizando la imagen preparada original y 0,0378 % cuando se alimentaron los decodificadores de ocho bits con el latente original; se trata de un caso seleccionado que no demuestra una causa general. La comparacion con un build de redondeo Q8_0 plano en 36 casos mostro un error latente 0,19 puntos porcentuales mayor de media para el build plano, peor en 23 de 36 casos, sin significacion estadistica.

## Requisitos de hardware

- Memoria grafica: el paso de Idol alcanzo un pico de 1.955 MiB de memoria asignada por PyTorch (2.754 MiB para el proceso completo con un limite de asignador de 2,5 GiB); en modo residente asigna entre 4,4 y 4,9 GB.
- idol.cpp mide la memoria grafica libre y elige entre ejecucion por etapas y modo residente.
- Modo lean: mantiene los modelos en disco en lugar de en memoria host; completo dos generaciones en un contenedor limitado a 4 GB de memoria donde el modo por etapas fue terminado.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; los requisitos de memoria sugieren que cabe en GPU de consumo con al menos 3 GB libres en modo por etapas.
- Opciones de despliegue: idol.cpp (servidor local, interfaz de navegador, linea de comandos e interfaz HTTP). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Idol-GGUF (este) | 879.302.053 | GGUF Q8_0 mixta, 967 MB | Apache 2.0 | Requiere codificadores externos DINOv3 y FLUX.2-dev |
| Idol original (speridlabs/idol) | no disponible | no disponible | no disponible | Referencia de precision original; mayor huella de memoria |
| Build Q8_0 plano (mencionado en la model card) | 879.302.053 | GGUF Q8_0 plano | Apache 2.0 | Error latente 0,19 pp mayor de media en 36 casos, sin significacion |

No se dispone de datos sobre otros modelos comparables de image-to-3D en la informacion proporcionada.

## Limitaciones y advertencias

- El archivo no incluye los dos codificadores de imagen (DINOv3 y el autoencoder de FLUX.2-dev), que son externos, estan sujetos a acceso restringido y tienen licencias propias distintas de la Apache 2.0 de este repositorio.
- Idol no acepta texto; requiere una imagen de entrada y, si se parte de una descripcion, un generador configurado aparte.
- Los benchmarks miden concordancia con el Idol original, no precision 3D frente a verdad de referencia; la cohorte es un conjunto de desafio seleccionado, no una muestra aleatoria.
- El suavizado y el filtrado de componentes pueden ocultar defectos de malla; las vistas aproximadas no son renderizado upstream.
- El peor caso observado (1,715 % de distancia de malla) es una diferencia real que los promedios ocultan.
- La variacion del modelo original entre semillas es contexto, no una allowance que reste al error de cuantizacion.
- Riesgo de sesgos: no documentado en la informacion disponible.
- Riesgo de alucinacion geometrica: no documentado; el modelo puede producir geometria plausible pero incorrecta en objetos fuera de la distribucion de entrenamiento.
- No se especifican idiomas soportados porque el modelo no procesa texto.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validacion comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rhuta/Idol-GGUF
- Modelo base Idol: https://huggingface.co/speridlabs/idol
- Runtime idol.cpp: https://github.com/TimeLordRaps/idol.cpp
- Guia de instalacion de idol.cpp: https://github.com/TimeLordRaps/idol.cpp#install
- Protocolo de benchmark: https://github.com/TimeLordRaps/idol.cpp/blob/main/docs/benchmark-gso32.md
- Sonda del peor caso: https://github.com/TimeLordRaps/idol.cpp/blob/main/docs/benchmark-gso32.md#post-hoc-worst-case-probe
- Especificacion GGUF: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
- DINOv3: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- FLUX.2-dev: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Iris-3B: https://huggingface.co/speridlabs/iris-3b
- Qwen3-VL-4B-Instruct-GGUF: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- Pagina del proyecto Idol: https://speridlabs.com/research/idol
