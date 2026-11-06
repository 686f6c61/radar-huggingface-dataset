# Shengdebao/Learning-ONBs

## Resumen

Learning-ONBs es un conjunto de checkpoints preentrenados que acompanan a la implementacion oficial del articulo *Learning Orthonormal Bases for Function Spaces* (NeurIPS 2026), de Hamidreza Kamkari, Mohammad Sina Nabizadeh y Justin Solomon. No es un modelo de lenguaje ni un sistema generativo de proposito general: es una coleccion de modelos de analisis funcional que aprenden bases ortonormales para espacios de funciones, en concreto descomposiciones FPCA (functional principal component analysis) sobre familias de senales e imagenes representadas como campos implicitos.

Cada subcarpeta del repositorio corresponde a un experimento de FPCA e incluye una funcion media aprendida, un diccionario con sintesis ortogonal aprendida y una isometria (un flujo euleriano) que transforma ese diccionario en funciones principales adaptadas a los datos. Los pesos se distribuyen en formato `safetensors` y se cargan mediante la libreria `infidictionary` del repositorio de GitHub asociado.

El interes es fundamentalmente de investigacion: ofrece una via para parametrizar y optimizar bases ortonormales de rango finito en espacios funcionales infinitos, algo relevante en analisis de formas, aprendizaje de representaciones implicitas y procesamiento de senales. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal que modela un generador antisimetrico de rango finito, integrado como EDO (flujo euleriano) para transformar una base de referencia en una base objetivo; diccionarios de sintesis ortogonal aprendidos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; opera sobre rejillas de muestreo, p. ej. 28x28 en `[0,1]^2`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (pesos), mas `config.yaml` y `metadata.json` por subcarpeta |

## Arquitectura y entrenamiento

La propuesta metodologica reduce la tarea de parametrizar y optimizar una base ortonormal infinita a modelar con una red neuronal un generador antisimetrico de rango finito e integrar la EDO resultante, de modo que una base de referencia se transforma de forma suave en la base objetivo. Cada experimento combina una funcion media aprendida, un diccionario con sintesis ortogonal aprendida y una isometria expresada como flujo euleriano que convierte el diccionario en funciones principales para los datos.

El repositorio contiene seis experimentos: tres en una dimension (`1d_fpca` con diccionario de Fourier, `1d_fpca_haar` con wavelets de Haar y `1d_fpca_voronoi` con celdas de Voronoi, todos sobre procesos tent + seno), y tres en dos dimensiones (`dwsnets_mnist_eulerian` sobre SIRENs de MNIST con Fourier 2D, `implicit_zoo_cifar_eulerian` sobre SIRENs de CIFAR-10 con Fourier 2D y RGB, y `celeba_eulerian` sobre CelebA-HQ a 64x64 con Fourier 2D y RGB). No se detallan en la informacion disponible el numero de tokens, la composicion exacta de los datasets ni si se emplearon tecnicas de RLHF o DPO, algo por otra parte ajeno al paradigma de estos modelos.

## Capacidades

- Aprendizaje y evaluacion de bases ortonormales para espacios de funciones, incluyendo funciones medias y funciones principales.
- Descomposicion FPCA sobre procesos 1D (tent + seno) con distintos diccionarios: Fourier, Haar y Voronoi.
- Extraccion de funciones principales sobre representaciones implicitas de imagenes (SIRENs) en 2D.
- Generacion de bases sobre rejillas arbitrarias mediante `SquareSampler` (por ejemplo, 28x28 en `[0,1]^2`) y el metodo `model.basis(xy, num_atoms=64)`, que devuelve tensores de forma `(64, 784, 1)`.
- Evaluacion de la energia capturada por la base aprendida, registrada en `metadata.json` junto con la epoca de entrenamiento.
- Soporte para datos RGB en los experimentos sobre CIFAR-10 y CelebA-HQ.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Analisis de formas y morfometria: usar la base aprendida para descomponer un conjunto de formas o contornos en componentes principales ortonormales y cuantificar la variabilidad dominante del conjunto.
- Compresion de representaciones implicitas: proyectar SIRENs de MNIST o CIFAR-10 sobre las primeras funciones principales para retener la mayor parte de la energia con pocos coeficientes, util en almacenamiento y transmision de campos neuronales.
- Modelado estadistico de imagenes medicas o cientificas: adaptar el flujo euleriano a un nuevo conjunto de campos implicitos para obtener una base especifica del dominio y estudiar modos de variacion.
- Procesamiento de senales 1D: emplear los experimentos `1d_fpca`, `1d_fpca_haar` o `1d_fpca_voronoi` como referencia para comparar diccionarios clasicos frente a bases aprendidas en tareas de filtrado o denoising.
- Investigacion en bases adaptativas: servir de linea base reproducible para nuevos metodos de aprendizaje de bases ortonormales, dado que el repositorio incluye configuracion de entrenamiento y pesos.
- Analisis de rostros en CelebA-HQ: obtener una base de componentes principales sobre retratos a 64x64 para estudiar variaciones de iluminacion, identidad o pose en el espacio de funciones.
- Docencia y divulgacion: reproducir los cuadernos de analisis del repositorio de GitHub, que descargan automaticamente estos checkpoints, para ilustrar FPCA con redes neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente registra, en `metadata.json`, la epoca de entrenamiento y la energia capturada por cada modelo, sin tablas comparativas con otros metodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano de los pesos no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponible. Al tratarse de modelos pequenos de investigacion, es probable que cualquier GPU consumer reciente sea suficiente, pero no hay datos que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada por falta de especificaciones de parametros.
- Opciones de despliegue: carga mediante la libreria `infidictionary` del repositorio de GitHub (`load_pretrained`), sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Learning-ONBs | FPCA con bases ortonormales aprendidas | no disponible | no aplica | no disponible | HuggingFace + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite conversacion ni instrucciones en lenguaje natural.
- El alcance esta restringido a los dominios de entrenamiento (procesos 1D tent + seno, SIRENs de MNIST y CIFAR-10, CelebA-HQ 64x64); extrapolar a otros dominios requiere reentrenar el flujo euleriano.
- No se declara licencia, por lo que el uso comercial queda sin autorizacion explicita y debe consultarse con los autores.
- Riesgo de sobreajuste a la resolucion y al muestreo empleados durante el entrenamiento (por ejemplo, rejillas de 28x28); cambios de resolucion pueden degradar la calidad de la base.
- Ausencia de benchmarks publicados en la informacion disponible, lo que impide validar el rendimiento frente a metodos clasicos de FPCA.
- Repositorio sin descargas ni likes y con fecha de creacion reciente: no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.
- Los resultados de energia capturada dependen del numero de atomos solicitado (`num_atoms`); no se documentan curvas de convergencia.

## Enlaces

- HuggingFace: https://huggingface.co/Shengdebao/Learning-ONBs
- Paper (arXiv): https://arxiv.org/abs/2605.19959
- Version HTML del paper: https://arxiv.org/html/2605.19959v1
- Codigo en GitHub: https://github.com/HamidrezaKmK/Learning-ONBs
