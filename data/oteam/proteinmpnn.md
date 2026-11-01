# oteam/proteinmpnn

## Resumen

ProteinMPNN es un modelo de diseño inverso de secuencias de proteínas (*inverse folding*): dada una estructura tridimensional de esqueleto proteico fija, genera secuencias de aminoácidos compatibles con esa geometría. Lo desarrolló originalmente un equipo del Institute for Protein Design (Universidad de Washington) liderado por Justas Dauparas y David Baker, y se publicó en *Science* en 2022. Esta ficha corresponde a `oteam/proteinmpnn`, una implementación no oficial publicada por el equipo de OFoldX dentro de su librería `ofoldx`, con pesos en formato safetensors.

El modelo no es un transformer de lenguaje: es una red neuronal de paso de mensajes (*message passing neural network*, MPNN) que representa cada residuo como un nodo de un grafo espacial de vecinos más cercanos y decodifica la secuencia en un orden causal muestreado. Con 1.673.592 parámetros (1,674 M), es un modelo extremadamente compacto que se ejecuta en CPU sin dificultad, lo que lo hace muy atractivo para pipelines de diseño de proteínas de alto rendimiento donde se generan miles de candidatos por estructura.

Su relevancia actual radica en que el diseño computacional de proteínas depende de generar secuencias que plieguen correctamente sobre un esqueleto dado; ProteinMPNN se ha convertido en un componente estándar de facto en flujos de diseño de proteínas junto con herramientas de predicción estructural como AlphaFold o ESMFold. Esta versión de OFoldX añade soporte para posiciones fijas, identidades ligadas, restricciones por posición y perfiles de secuencia, además de una variante para proteínas solubles (SolubleMPNN) y una variante que solo usa el átomo CA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (MPNN) sobre grafo espacial de residuos, encoder-decoder autoregresivo |
| Parametros totales | 1.673.592 (1,674 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (longitud de proteína limitada por memoria y grafo de vecinos; vecinos por nodo: 48) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Átomos de esqueleto | N, CA, C, O (variante estándar) |
| Tamaño oculto | 128 |
| Bloques encoder / decoder | 3 / 3 |
| Vecinos por nodo | 48 |
| Librería | ofoldx |
| Pipeline | other (diseño y scoring de secuencias) |

## Arquitectura y entrenamiento

ProteinMPNN modela la proteína como un grafo k-NN espacial (k = 48 vecinos por residuo) construido a partir de las coordenadas del esqueleto. Un encoder de 3 bloques de paso de mensajes propaga información geométrica entre residuos vecinos, y un decoder de 3 bloques, también con paso de mensajes, genera la secuencia de aminoácidos en un orden causal muestreado. El tamaño oculto es de 128 dimensiones. La decodificación autoregresiva con orden aleatorio es una de las innovaciones clave: evita el sesgo direccional N→C y permite condicionar posiciones ya fijadas.

El entrenamiento se realiza por recuperación de identidad de aminoácidos a partir de la geometría del esqueleto, con perturbaciones de coordenadas para dotar de robustez al modelo. La variante estándar usa los cuatro átomos de esqueleto (N, CA, C, O); la variante CA-only usa únicamente el carbono alfa. La variante SolubleMPNN se entrena enfocándose en proteínas solubles. Los datos de entrenamiento del ejemplo oficial son ensamblados biológicos del PDB a fecha de 2 de agosto de 2021, con cadenas agrupadas al 30 % de identidad de secuencia. El número exacto de tokens o residuos de entrenamiento no está disponible en la información proporcionada.

Las variantes de ruido de entrenamiento (0,02, 0,10, 0,20 y 0,30 Å) permiten elegir el nivel de tolerancia a imprecisión en las coordenadas de entrada, algo relevante cuando el esqueleto proviene de un modelo predictivo y no de una estructura experimental.

## Capacidades

- Diseño inverso de secuencias: genera secuencias de aminoácidos condicionadas a un esqueleto proteico fijo en formato PDB o mmCIF.
- Puntuación de secuencias: calcula la log-verosimilitud negativa (NLL) por residuo en nats, útil para rankear diseños o evaluar compatibilidad secuencia-estructura.
- Fijado de posiciones: permite mantener posiciones concretas de la secuencia durante el diseño.
- Identidades ligadas: soporta restricciones de identidad compartida entre posiciones (tied identities).
- Restricciones específicas por posición: permite especificar el conjunto de aminoácidos permitidos en cada posición.
- Perfiles de secuencia: admite condicionamiento mediante perfiles de secuencia.
- Orden de decodificación muestreado: el scoring puede promediar múltiples órdenes de decodificación (`num_decoding_orders`) para estimaciones más estables.
- Integración con empaquetado de cadenas laterales: pipeline `ProteinMpnnDesignAndPackPipeline` que combina diseño y *packing* con un MPNN Packer independiente.
- Ejecución en CPU: con 1,674 M de parámetros, no requiere GPU para inferencia.

## Casos de uso

- Diseño de novo de proteínas: dado un esqueleto generado por un modelo generativo estructural, ProteinMPNN produce secuencias candidatas que se pliegan sobre esa geometría; el pipeline puede generar cientos de secuencias por esqueleto y rankearlas por NLL.
- Rediseño de proteínas naturales: partiendo de una estructura experimental del PDB, se generan variantes de secuencia manteniendo el pliegue, útil para optimizar estabilidad o expresión sin alterar la arquitectura tridimensional.
- Optimización de solubilidad: la variante SolubleMPNN permite rediseñar secuencias priorizando compatibilidad con proteínas solubles, relevante para producción recombinante.
- Filtrado y ranking de candidatos: el modo *scoring* calcula NLL por residuo y permite descartar secuencias poco probables antes de pasar a validación experimental o a predicción estructural con AlphaFold/ESMFold.
- Diseño con restricciones funcionales: el fijado de posiciones y las restricciones por posición permiten preservar sitios activos, epítopos o residuos de unión mientras se rediseña el resto de la secuencia.
- Integración en pipelines de alto rendimiento: al ser un modelo de 1,674 M de parámetros ejecutable en CPU, se puede desplegar en clústeres sin GPU para generar y puntuar miles de diseños en paralelo.
- Diseño y empaquetado de cadenas laterales: combinando el diseño con el MPNN Packer se obtienen coordenadas completas de cadena lateral, necesarias para análisis de interacciones o docking posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32; el modelo tiene 1,674 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 3060 en adelante, A100, H100) acelera el procesamiento por lotes, pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 1 GB de memoria; también en CPU.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`) es la vía oficial de esta implementación; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño de la proteína, del número de órdenes de decodificación y de los recursos de cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/proteinmpnn | 1,674 M | Esqueleto N, CA, C, O | AGPL-3.0 | HuggingFace (ofoldx) |
| oteam/solublempnn | 1,674 M | Esqueleto N, CA, C, O | AGPL-3.0 | HuggingFace (ofoldx) |
| oteam/proteinmpnn-ca-only | 1,642 M | Solo CA | AGPL-3.0 | HuggingFace (ofoldx) |
| dauparas/ProteinMPNN (oficial) | ~1,7 M | Esqueleto completo | MIT (repo oficial) | GitHub |

Las tres variantes de OFoldX comparten arquitectura y difieren en los átomos de entrada y en el sesgo de entrenamiento (solubilidad). El repositorio oficial de Dauparas et al. ofrece los mismos modelos con licencia MIT, lo que es relevante si la AGPL-3.0 de esta implementación supone un problema para uso comercial. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo original de ProteinMPNN no escribió esta tarjeta ni necesariamente avala esta implementación; para producción conviene contrastar con el repositorio oficial.
- Licencia AGPL-3.0: es una licencia copyleft fuerte; el uso comercial en servicios en red puede obligar a liberar el código modificado. El repositorio oficial de Dauparas usa licencia MIT, lo que puede ser preferible según el caso.
- Dependencia de la geometría de entrada: la calidad del diseño depende de la precisión del esqueleto; esqueletos generados por modelos predictivos introducen errores que las variantes con mayor ruido de entrenamiento mitigan parcialmente.
- Sin datos de benchmarks en esta ficha: no se han podido verificar métricas de recuperación de secuencia ni tasas de éxito experimental para esta implementación concreta.
- Riesgo de secuencias no plegables: como todo modelo de inverse folding, puede generar secuencias de baja verosimilitud estructural; se recomienda filtrar por NLL y validar con predicción estructural.
- Idiomas: no aplica; el modelo no procesa texto.
- Sesgos de dataset: entrenado sobre el PDB, con sobrerrepresentación de ciertas familias proteicas y sesgo hacia proteínas solubles y bien caracterizadas estructuralmente.
- Longitud de contexto: no documentada; proteínas muy grandes pueden requerir ajustes de memoria o particionado del grafo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/proteinmpnn
- Variante SolubleMPNN: https://huggingface.co/oteam/solublempnn
- Variante CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
- Ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial: https://github.com/dauparas/ProteinMPNN
- Guía de entrenamiento oficial: https://github.com/dauparas/ProteinMPNN/blob/main/training/README.md
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Librería ofoldx: https://ofoldx.valtech.ai/
