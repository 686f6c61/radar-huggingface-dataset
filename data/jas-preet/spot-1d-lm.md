# Jas-preet/SPOT-1D-LM

## Resumen

SPOT-1D-LM es un conjunto de checkpoints para la predicción de propiedades estructurales de proteínas a partir de una única secuencia de aminoácidos, sin necesidad de alineamientos múltiples de secuencias (MSA). Desarrollado por Jaspreet Singh (publicado en *Scientific Reports* en 2022 junto con K. Paliwal, T. Litfin, J. Singh y Y. Zhou), el modelo predice estructura secundaria en 3 y 8 estados, accesibilidad al disolvente (ASA), exposición de hemisferio (half-sphere exposure), número de contactos y ángulos de cadena principal (ψ, ϕ, θ, τ).

La innovación principal consiste en sustituir los perfiles de alineamiento (MSA), tradicionalmente costosos de calcular y dependientes de bases de datos actualizadas, por embeddings extraídos de dos modelos de lenguaje de proteínas: ESM-1b y ProtT5. El repositorio contiene un ensemble de tres arquitecturas (una LSTM bidireccional, una ResNet multi-escala y una ResNet-LSTM multi-escala), cada una en variantes de clasificación y regresión, empaquetadas como checkpoints TorchScript.

El modelo es relevante para la comunidad de bioinformática porque demuestra que es posible alcanzar una precisión comparable a los métodos basados en perfiles de alineamiento sin depender de MSAs, lo que reduce drásticamente el coste computacional y permite aplicaciones sobre proteínas huérfanas o secuencias sin homólogos conocidos. La entrada está limitada a 1.024 residuos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de LSTM bidireccional, ResNet multi-escala y ResNet-LSTM multi-escala sobre embeddings de ESM-1b y ProtT5 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 residuos (longitud máxima de secuencia de entrada) |
| Tipos de cuantizacion | no disponible (checkpoints TorchScript en precisión original) |
| Idiomas soportados | no aplica (modelo biológico sobre secuencias de aminoácidos) |
| Licencia | MIT |
| Formato de pesos | TorchScript (archivo `spot_1d_lm.tar.gz`, 956 MB, con archivo anidado `SPOT-LM-checkpoints.xz`) |

## Arquitectura y entrenamiento

SPOT-1D-LM no es un transformer generativo, sino un ensemble de tres redes entrenadas de forma supervisada para tareas de predicción estructura-función. Cada miembro del ensemble procesa las representaciones por residuo generadas por ESM-1b y ProtT5 y produce predicciones por residuo: etiquetas de estructura secundaria (3 y 8 estados), valores continuos de ASA, half-sphere exposure, número de contactos y los cuatro ángulos de cadena principal. El ensemble combina una LSTM bidireccional, una ResNet multi-escala y una ResNet-LSTM multi-escala, con cabeceras separadas para clasificación y regresión.

El entrenamiento se realizó sobre 38.913 proteínas de ProteinNet (entradas del PDB anteriores a 2016, resolución inferior a 2,5 Å, agrupadas al 95 % de identidad de secuencia). Las secuencias de entrada se truncan a 1.024 residuos. Los embeddings de ESM-1b y ProtT5 no se incluyen en el repositorio: se descargan por separado mediante sus propias librerías la primera vez que se ejecuta el pipeline. El archivo distribuido incluye también los datos de entrenamiento y test (carpetas `fasta`, `dssp`, `hse` y `theta`, además de las listas de train, validación y test).

## Capacidades

- Predicción de estructura secundaria de proteínas en 3 estados (hélice, hoja, coil) y en 8 estados (incluyendo hélices 3-10, hélices pi y puentes beta).
- Predicción de accesibilidad al disolvente (ASA) por residuo.
- Predicción de half-sphere exposure (HSE) en las orientaciones definidas por el modelo.
- Predicción del número de contactos por residuo.
- Predicción de ángulos de cadena principal: ψ (psi), ϕ (phi), θ (theta) y τ (tau).
- Funcionamiento a partir de una única secuencia, sin requerir MSA ni bases de datos de homólogos.
- Uso de embeddings de dos modelos de lenguaje de proteínas (ESM-1b y ProtT5) como representación de entrada.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: es un modelo especializado de predicción estructural.

## Casos de uso

- Anotación estructural a gran escala de proteomas: dado que no requiere MSA, permite procesar secuencias de forma masiva (por ejemplo, genomas recién secuenciados) y obtener anotaciones de estructura secundaria y accesibilidad sin coste de alineamiento.
- Proteínas huérfanas y secuencias sin homólogos: al depender solo de la secuencia, es aplicable a proteínas sin parientes conocidos en las bases de datos, donde los métodos basados en perfiles fallan o degradan.
- Priorización en pipelines de biología estructural: las predicciones de ASA, contactos y ángulos pueden usarse como señal previa para decidir qué proteínas merecen un estudio experimental o un modelado 3D más costoso.
- Ingeniería de proteínas: la predicción de exposición al disolvente y estructura secundaria por residuo ayuda a identificar posiciones candidatas a mutación (por ejemplo, residuos enterrados frente a expuestos) antes de diseñar variantes.
- Enriquecimiento de datasets de entrenamiento: las predicciones pueden servir como etiquetas auxiliares o features en pipelines de aprendizaje automático posteriores (predicción de función, estabilidad, interacciones).
- Docencia y validación metodológica: el repositorio incluye datos de entrenamiento y test, lo que permite reproducir el benchmark y comparar contra métodos basados en MSA en un entorno controlado.
- Análisis de regiones desordenadas: la combinación de predicciones de estructura secundaria y accesibilidad facilita identificar segmentos con baja propensión a estructura ordenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los checkpoints TorchScript suman 956 MB comprimidos, pero la inferencia requiere además cargar ESM-1b (aproximadamente 650 M de parámetros) y ProtT5 (aproximadamente 3 000 M de parámetros), que dominan el consumo de memoria.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño de los modelos de lenguaje de proteínas subyacentes, se requiere una GPU con memoria suficiente para cargar ESM-1b y ProtT5 simultáneamente; una GPU de 16 GB o superior es un punto de partida razonable, aunque el dato no está confirmado por el autor.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; depende del modelo de lenguaje de proteínas cargado y de si se ejecutan en FP16.
- Opciones de despliegue: el repositorio oficial (https://github.com/jas-preet/SPOT-1D-LM) proporciona el código y las instrucciones de ejecución; los checkpoints son TorchScript y se cargan con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque de entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|
| SPOT-1D-LM | Secuencia única con embeddings ESM-1b + ProtT5 | SS3, SS8, ASA, HSE, contactos, ángulos | MIT | Hugging Face + GitHub |
| SPOT-1D (versión previa) | Perfiles MSA | SS3, SS8, ASA, contactos, ángulos | no disponible en la información | Repositorio del grupo |
| Métodos basados en ESMFold / ESM-2 | Secuencia única (pliegue completo) | Estructura 3D | MIT (ESM) | Hugging Face / GitHub |

La comparación cuantitativa con SPOT-1D y con métodos basados en MSA no está disponible en la información proporcionada; el artículo citado (doi:10.1038/s41598-022-11684-w) es la referencia para esos datos.

## Limitaciones y advertencias

- Longitud máxima de entrada de 1.024 residuos; las secuencias más largas deben truncarse o dividirse, lo que puede degradar las predicciones en proteínas grandes.
- Dependencia de dos modelos externos (ESM-1b y ProtT5) que se descargan por separado; esto añade requisitos de almacenamiento, memoria y conectividad no incluidos en el repositorio de 1 GB.
- Modelo especializado en bioinformática: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de lenguaje general.
- Riesgo de error en regiones de estructura ambigua o en proteínas con plegamiento atípico; las predicciones son probabilísticas y deben interpretarse con cautela en producción.
- Sesgo de los datos de entrenamiento: ProteinNet con entradas del PDB anteriores a 2016 y resolución inferior a 2,5 Å, lo que puede infrarepresentar ciertas familias proteicas o estados conformacionales.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar también las licencias de ESM-1b y ProtT5, que se distribuyen por separado y pueden tener condiciones propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-11-08) es posterior a la publicación del artículo; conviene verificar la integridad del archivo con el SHA-256 indicado antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Jas-preet/SPOT-1D-LM
- Repositorio GitHub: https://github.com/jas-preet/SPOT-1D-LM
- Perfil del autor en GitHub: https://github.com/jas-preet
- Artículo: Singh J, Paliwal K, Litfin T, Singh J, Zhou Y. Reaching alignment-profile-based accuracy in predicting protein secondary and tertiary structural properties without alignment. *Scientific Reports*. 2022;12:7607. https://doi.org/10.1038/s41598-022-11684-w
- Descarga directa del archivo: https://huggingface.co/Jas-preet/SPOT-1D-LM/resolve/main/spot_1d_lm.tar.gz
