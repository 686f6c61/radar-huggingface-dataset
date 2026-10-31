# oteam/proteinmpnn-noise010

## Resumen

ProteinMPNN (variante con ruido de entrenamiento de 0,10 Å) es un modelo de diseño inverso de plegamiento (*inverse folding*) que genera secuencias de aminoácidos para una estructura proteica de esqueleto (*backbone*) fija. El modelo original fue desarrollado por el laboratorio de David Baker (Justas Dauparas et al.) y publicado en *Science* en 2022; esta versión es una reimplementación no oficial publicada por el equipo de OFoldX en Hugging Face, con los pesos en formato safetensors y una biblioteca propia (`ofoldx`) para su uso.

El problema que resuelve es central en el diseño de proteínas computacional: dado un esqueleto tridimensional (por ejemplo, generado con RFdiffusion o procedente de una estructura experimental), obtener una secuencia aminoacídica que se pliegue de forma estable en ese esqueleto. ProteinMPNN resolvió este problema con una fiabilidad muy superior a métodos anteriores como Rosetta Design, y se ha convertido en un componente estándar de los flujos de diseño de proteínas de nueva generación.

Su relevancia actual radica en que sigue siendo el método de referencia para el paso de diseño de secuencia en pipelines de diseño de proteínas, y esta versión en Hugging Face lo integra en un ecosistema de pipelines (`ofoldx`) que facilita su uso junto a otras herramientas. Es un modelo muy pequeño (1,67 millones de parámetros), con una arquitectura de red neuronal de paso de mensajes (*message-passing neural network*) autoregresiva, ocultamiento (*hidden size*) de 128, 3 bloques de codificador y 3 de decodificador, y 48 vecinos espaciales por residuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes autoregresiva (message-passing neural network) para *inverse folding* |
| Parametros totales | 1.673.592 (1,674 M) |
| Parametros activos | no disponible (no es MoE; todos los parametros se activan en cada pasada) |
| Longitud de contexto | no disponible (opera sobre grafos espaciales de residuos con 48 vecinos por residuo) |
| Tipos de cuantizacion | no disponible (pesos en precision completa) |
| Idiomas soportados | no disponible (modelo de dominio biologico, no de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ProteinMPNN representa la proteina como un grafo de vecinos mas proximos en el espacio: cada nodo es un residuo y las aristas conectan a los 48 vecinos mas cercanos. El codificador procesa la geometria del esqueleto (atomos N, CA, C y O) mediante bloques de paso de mensajes, y el decodificador genera la secuencia de forma autoregresiva siguiendo un orden causal de residuos muestreado aleatoriamente en cada pasada. Esta decodificacion con orden aleatorio es una de las innovaciones clave del metodo: permite generar subconjuntos de cadenas o posiciones (por ejemplo, fijar algunas posiciones o ligar identidades entre cadenas) y mejora la diversidad de las secuencias generadas.

El modelo se entrena para recuperar las identidades de aminoacidos a partir de la geometria del esqueleto. El dato de entrenamiento oficial utiliza ensamblados biologicos de la PDB a fecha del 2 de agosto de 2021, con cadenas de proteina agrupadas en clusters al 30 % de identidad de secuencia para evitar fuga de datos. Un elemento distintivo del entrenamiento es la aplicacion de perturbaciones de coordenadas (ruido gaussiano sobre el esqueleto): esta variante concreta fue entrenada con un ruido de 0,10 A, lo que hace que el modelo sea tolerante a imprecisiones en el esqueleto de entrada, algo critico cuando se trabaja con esqueletos generados computacionalmente.

## Capacidades

- **Diseno de secuencias sobre esqueleto fijo**: genera secuencias de aminoacidos compatibles con una geometria tridimensional dada, con soporte para multiples ordenes de decodificacion.
- **Restricciones de diseno**: admite posiciones fijas (residuos que no se rediseñan), identidades ligadas entre posiciones o cadenas, restricciones especificas de aminoacidos por posicion y perfiles de secuencia como condicionamiento.
- **Puntuacion de secuencias**: evalua la log-verosimilitud negativa (NLL, en nats por residuo) de una secuencia dada sobre un esqueleto, util como metrica de calidad en pipelines de diseño.
- **Diseno multi-cadena**: al operar sobre ensamblados y con orden de decodificacion muestreado, puede rediseñar complejos con varias cadenas.
- **Empaquetado de cadenas laterales**: se puede combinar con el modelo MPNN Packer (cargable de forma independiente) mediante la pipeline `ProteinMpnnDesignAndPackPipeline` para generar coordenadas de cadenas laterales tras el diseño de secuencia.
- **Ejecucion por etapas**: las pipelines de `ofoldx` soportan ejecucion escalonada (`prepare`, `forward`, `postprocess`), util para integraciones en flujos de trabajo mas amplios.
- **Tolerancia a ruido en el esqueleto**: gracias al entrenamiento con perturbaciones de 0,10 A, funciona de forma robusta con esqueletos imperfectos o generados por modelos difusivos.

## Casos de uso

- **Completado de pipelines de diseño de proteínas de novo**: tras generar un esqueleto con herramientas como RFdiffusion, este modelo asigna la secuencia aminoacidica; es el paso estandar del flujo de trabajo del Instituto Baker y el uso principal del modelo.
- **Rediseño de enzimas y proteinas existentes**: partiendo de una estructura experimental de la PDB, se pueden fijar los residuos del centro activo y rediseñar el resto de la proteina para mejorar estabilidad o solubilidad manteniendo la funcion.
- **Estabilizacion de dominios de union o andamios terapeuticos**: se puede rediseñar un andamio (por ejemplo, un dominio de union a antigeno) fijando los residuos de la interfaz de union y optimizando el resto.
- **Puntuacion y filtrado de candidatos**: la pipeline de scoring permite calcular la NLL por residuo de secuencias candidatas sobre un esqueleto, y usarla como criterio de seleccion antes de sintetizar, reduciendo coste experimental.
- **Diseño de complejos proteicos multi-cadena**: gracias al soporte de identidades ligadas y orden de decodificacion flexible, se pueden diseñar interfaces entre cadenas de un ensamblado de forma coordinada.
- **Generacion de cadenas laterales automatica**: combinando el diseño de secuencia con el MPNN Packer se obtienen coordenadas completas de la estructura (esqueleto mas cadenas laterales), util como entrada para validacion con AlphaFold o RoseTTAFold.
- **Investigacion en biologia computacional y educacion**: la reimplementacion en `ofoldx` con pesos en safetensors facilita la experimentacion, la comparacion de variantes (niveles de ruido, CA-only, soluble) y el uso docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La metrica estandar para este tipo de modelos es la tasa de recuperacion de secuencia (*sequence recovery*) y la tasa de exito experimental (porcentaje de secuencias diseñadas que se pliegan correctamente), pero esta ficha no dispone de cifras concretas para esta reimplementacion. El articulo original de Dauparas et al. (2022) reporto una recuperacion de secuencia superior a metodos previos, pero no se reproducen aqui numeros especificos para evitar datos no verificados.

## Requisitos de hardware

- **VRAM estimada**: con 1,67 millones de parametros, el modelo es trivial en cuanto a memoria; cualquier GPU moderna (incluso con 2-4 GB de VRAM) es suficiente para inferencia. No se requieren cuantizaciones.
- **GPU recomendadas**: no es necesario hardware especializado; una RTX 3060, RTX 4090 o cualquier GPU de servidor (T4, A100) ejecuta el modelo sin problema. La mayor parte del tiempo de computo se dedica a la construccion del grafo de vecinos, no a la red neuronal.
- **Cabe en GPU de consumo**: si, holgadamente. Incluso es probable que funcione en CPU para proteinas pequenas, aunque sin datos oficiales de latencia.
- **Opciones de despliegue**: mediante la biblioteca `ofoldx` (`pip install ofoldx`), con pipelines de diseño y de scoring listas para usar. No aplica despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible. Al ser un modelo tan pequeno, el cuello de botella suele ser el preprocesamiento estructural y el numero de ordenes de decodificacion muestreadas.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProteinMPNN (ofoldx, esta version) | 1,674 M | Inverse folding con grafo de paso de mensajes, ruido 0,10 A | AGPL-3.0 | Pesos en Hugging Face, codigo en OFoldX |
| ProteinMPNN oficial (dauparas/ProteinMPNN) | ~1,67 M | Implementacion original en PyTorch | No comercial (licencia de codigo abierta con restricciones) | Codigo y pesos en GitHub |
| LigandMPNN (Institute for Protein Design) | no disponible | Extension de ProteinMPNN que incorpora ligandos y metales como contexto | no disponible | Codigo en GitHub (IPD) |
| ESM-IF1 (Meta AI) | ~142 M (modelo de lenguaje inverso) | Inverse folding con GVP + transformer sobre ESM-2 | MIT / no comercial (segun componentes) | Codigo y pesos en GitHub/Hugging Face |

ProteinMPNN sigue siendo el estandar de facto por su combinacion de rapidez, robustez al ruido del esqueleto y tasa de exito experimental demostrada; ESM-IF1 ofrece una alternativa basada en transformer con buen rendimiento, y LigandMPNN extiende el enfoque cuando el contexto incluye pequenas moleculas.

## Limitaciones y advertencias

- **Licencia AGPL-3.0**: es una licencia copyleft fuerte. Cualquier servicio de red que utilice este modelo debera liberar el codigo fuente de la aplicacion. Esto puede ser un impedimento serio para uso comercial cerrado; conviene revisar tambien la licencia de la implementacion original, que tiene restricciones propias.
- **Implementacion no oficial**: esta version es una reimplementacion del equipo OFoldX, no del laboratorio original. Aunque el articulo de referencia es el oficial, los resultados pueden diferir de la implementacion de Dauparas et al.; para trabajo reproducible de alta exigencia, conviene verificar contra el repositorio oficial.
- **No garantiza plegabilidad**: el modelo diseña secuencias compatibles con un esqueleto, pero la validacion experimental (o computacional con AlphaFold/RoseTTAFold) sigue siendo imprescindible antes de sintetizar.
- **Dependencia de la calidad del esqueleto**: aunque el entrenamiento con ruido de 0,10 A aporta tolerancia, esqueletos muy defectuosos producen secuencias poco fiables.
- **Alucinacion / riesgo biologico**: no aplica el concepto de alucinacion propio de modelos de lenguaje, pero las secuencias generadas pueden contener motivos indeseados; todo diseño de proteinas conlleva consideraciones de bioseguridad que deben evaluarse caso por caso.
- **Sin soporte de ligandos**: la variante estandar no condiciona sobre ligandos, metales o ADN; para eso existe LigandMPNN.
- **Descargas y adopcion minimas**: el repositorio muestra 1 descarga y 1 like, lo que indica adopcion practicamente nula y ausencia de validacion comunitaria de esta reimplementacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/proteinmpnn-noise010
- Articulo original (Science, 2022): https://doi.org/10.1126/science.add2187
- Repositorio oficial de ProteinMPNN: https://github.com/dauparas/ProteinMPNN
- Codigo de la reimplementacion (OFoldX): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Documentacion de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Biblioteca ofoldx: https://ofoldx.valtech.ai/
- Variante estandar (ruido 0,02 A): https://huggingface.co/oteam/proteinmpnn-noise002
- Variante soluble: https://huggingface.co/oteam/solublempnn
- Variante CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
