# oteam/proteinmpnn-ca-only-noise010

## Resumen

ProteinMPNN es un modelo de diseño inverso de secuencias proteicas ("inverse folding") que, dada una estructura tridimensional de esqueleto proteico fija, genera secuencias de aminoácidos compatibles con dicha geometría. El modelo original fue desarrollado por Justas Dauparas, David Baker y colaboradores, y publicado en *Science* en 2022. Esta ficha corresponde a la implementación no oficial publicada por el equipo OFoldX bajo el identificador `oteam/proteinmpnn-ca-only-noise010`, una variante que emplea únicamente el átomo de carbono alfa (CA) como representación del esqueleto y que fue entrenada con un nivel de ruido de coordenadas de 0,10 Å.

La arquitectura es una red neuronal de paso de mensajes (message-passing neural network) autoregresiva sobre un grafo de vecinos espaciales más cercanos. Con 1.641.720 parámetros reales (1,642 M), un tamaño oculto de 128, tres bloques de codificador y tres de decodificador, y 48 vecinos por residuo, es un modelo extremadamente compacto que se ejecuta en CPU sin dificultad. La variante CA-only reduce la información de entrada respecto al modelo de esqueleto completo (que usa N, CA, C y O), lo que la hace útil cuando solo se dispone de la traza de carbonos alfa, por ejemplo tras una predicción de estructura de baja resolución o en diseños de novo simplificados.

La relevancia actual reside en su uso como componente estándar en flujos de diseño de proteínas: generación de secuencias para esqueletos generados por difusión (RFdiffusion y similares), scoring de secuencias, y diseño con restricciones posicionales. La licencia AGPL-3.0 y su naturaleza no oficial son factores críticos a evaluar antes de un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de paso de mensajes (message-passing) autoregresiva sobre grafo k-NN espacial; 3 bloques de codificador y 3 de decodificador; tamaño oculto 128 |
| Parametros totales | 1.641.720 (1,642 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la longitud viene limitada por el número de residuos de la proteína de entrada; no se especifica un máximo) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Atomos de esqueleto de entrada | Solo CA |
| Vecinos por residuo | 48 |
| Ruido de entrenamiento | 0,10 Å |
| Libreria | ofoldx |
| Pipeline | other (diseño inverso de proteínas) |

## Arquitectura y entrenamiento

ProteinMPNN representa cada residuo como un nodo de un grafo de vecinos espaciales más cercanos (48 vecinos) y codifica la geometría del esqueleto mediante bloques de paso de mensajes. El decodificador genera los residuos de forma autoregresiva en un orden causal muestreado, lo que permite condicionar cada posición en las ya generadas. Esta variante CA-only emplea exclusivamente la posición del carbono alfa como información estructural, frente a las cuatro coordenadas (N, CA, C, O) del modelo estándar; el resto de hiperparámetros (tamaño oculto 128, 3+3 bloques, 48 vecinos) se mantiene idéntico, lo que explica la ligera reducción de parámetros (1,642 M frente a 1,674 M del estándar).

El entrenamiento sigue el esquema de recuperación autoregresiva de secuencia con perturbaciones de coordenadas para aumentar la robustez frente a imprecisión estructural; en esta variante la perturbación aplicada es de 0,10 Å. Los datos de entrenamiento del ejemplo oficial corresponden a ensamblados biológicos del PDB de 2 de agosto de 2021, con cadenas proteicas agrupadas al 30 % de identidad de secuencia. La model card no detalla el número de tokens ni la composición exacta del dataset para esta variante concreta, por lo que esos datos deben considerarse no disponibles. La generación admite posiciones fijas, identidades ligadas, restricciones de aminoácido por posición y perfiles de secuencia.

## Capacidades

- Diseño inverso de secuencias proteicas a partir de una estructura de esqueleto fija (solo traza CA en esta variante).
- Scoring de secuencias: cálculo de log-verosimilitud negativa (NLL) global y por residuo en nats por residuo, promediando sobre varios órdenes de decodificación.
- Generación con restricciones: posiciones fijas, identidades ligadas entre posiciones, restricciones de aminoácido específicas por posición y perfiles de secuencia.
- Muestreo de órdenes de decodificación causales, lo que permite estimar incertidumbre mediante múltiples pasadas.
- Integración con un empaquetador de cadenas laterales (MPNN Packer) para generar coordenadas de cadenas laterales tras el diseño de secuencia.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües; es un modelo específico de biología estructural.

## Casos de uso

- Diseño de secuencias para esqueletos generados por difusión: tras obtener un backbone de novo con herramientas como RFdiffusion, ProteinMPNN CA-only genera secuencias compatibles usando solo la traza CA, lo que acelera el pipeline al no requerir reconstrucción completa del esqueleto.
- Scoring y filtrado de candidatos: calcular la NLL por residuo sobre secuencias propuestas permite descartar diseños poco plausibles antes de pasar a validación experimental, usando varios órdenes de decodificación para estabilizar la estimación.
- Rediseño de proteínas con restricciones funcionales: fijar posiciones del sitio activo o residuos de unión y rediseñar el resto de la secuencia, útil en ingeniería de enzimas y anticuerpos.
- Diseño sobre estructuras predichas de baja resolución: cuando solo se dispone de coordenadas CA fiables (por ejemplo, modelos AlphaFold recortados o trazas experimentales incompletas), esta variante evita introducir información de esqueleto inexistente o ruidosa.
- Humanización y estabilización de secuencias: generar variantes de una proteína manteniendo el pliegue y evaluar su compatibilidad estructural mediante scoring, como paso previo a cribados experimentales.
- Docencia y prototipado rápido: con 1,6 M de parámetros y ejecución en CPU, sirve para experimentar con flujos de diseño inverso sin infraestructura GPU.
- Integración en pipelines de diseño y empaquetado: combinar el diseño de secuencia con el MPNN Packer para obtener estructuras completas con cadenas laterales antes de simulaciones de dinámica molecular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 1,6 M de parámetros (unos 6,6 MB en fp32), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente; el cuello de botella será la construcción del grafo de vecinos y el tamaño de la proteína, no el modelo.
- Cabe en GPU consumer: sí, en todas, incluidas iGPU y ejecución en CPU.
- Opciones de despliegue: librería `ofoldx` (pip install ofoldx), con pipelines `design` y `score`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del número de residuos y del número de órdenes de decodificación muestreados.

## Comparativa con modelos similares

| Modelo | Átomos de esqueleto | Parámetros | Ruido de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| proteinmpnn-ca-only-noise010 (esta ficha) | CA | 1,642 M | 0,10 Å | AGPL-3.0 | HuggingFace (oteam) |
| proteinmpnn (estándar) | N, CA, C, O | 1,674 M | 0,02 / 0,10 / 0,20 / 0,30 Å | AGPL-3.0 | HuggingFace (oteam) |
| solublempnn | N, CA, C, O | 1,674 M | 0,02 / 0,10 / 0,20 / 0,30 Å | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN oficial | N, CA, C, O | ~1,7 M | No especificado en esta ficha | MIT (repo original) | GitHub dauparas/ProteinMPNN |

La comparativa se limita a las variantes de la misma familia publicadas por OFoldX y a la implementación oficial; no se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo original de ProteinMPNN no escribió esta ficha ni validó esta implementación; los resultados pueden diferir de los del repositorio oficial.
- Licencia AGPL-3.0: es una licencia copyleft fuerte que impone obligaciones de distribución del código fuente a quien ofrezca el modelo como servicio en red; conviene revisar su compatibilidad con el uso comercial previsto. La implementación oficial en GitHub usa licencia MIT, lo que puede ser preferible en entornos propietarios.
- Entrada limitada a CA: al usar solo la traza de carbono alfa, el modelo pierde información de orientación del enlace peptídico y de los átomos N, C y O, lo que puede reducir la precisión del diseño frente a la variante de esqueleto completo en estructuras de alta resolución.
- Riesgo de secuencias no plegables: como todo modelo de diseño inverso, puede generar secuencias que no se plieguen en la estructura objetivo; se recomienda validación con predictores de estructura y scoring.
- Sesgos de los datos de entrenamiento: entrenado sobre ensamblados del PDB de 2021 agrupados al 30 % de identidad; puede estar sesgado hacia familias proteicas sobrerrepresentadas y tener menor rendimiento en proteínas de membrana o regiones intrínsecamente desordenadas.
- Sin datos de benchmarks publicados para esta variante concreta, lo que impide comparar su rendimiento de forma cuantitativa con alternativas.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni tool calling; la interfaz es estructural (ficheros CIF/PDB).
- No se documentan cuantizaciones ni requisitos de despliegue en producción más allá de la librería `ofoldx`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/proteinmpnn-ca-only-noise010
- Variante CA-only base: https://huggingface.co/oteam/proteinmpnn-ca-only
- Variante CA-only noise002: https://huggingface.co/oteam/proteinmpnn-ca-only-noise002
- Variante CA-only noise020: https://huggingface.co/oteam/proteinmpnn-ca-only
- Modelo estándar: https://huggingface.co/oteam/proteinmpnn
- Modelo soluble: https://huggingface.co/oteam/solublempnn
- Ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Código OFoldX (proteinmpnn): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Guía de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Documentación de ofoldx: https://ofoldx.valtech.ai/
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial ProteinMPNN: https://github.com/dauparas/ProteinMPNN
- README de entrenamiento oficial: https://github.com/dauparas/ProteinMPNN/blob/main/training/README.md
