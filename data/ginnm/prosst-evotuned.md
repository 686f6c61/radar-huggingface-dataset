# GinnM/ProSST-Evotuned

## Resumen

ProSST-Evotuned es un checkpoint de pesos de una red neuronal de grafos (GNN) ProtSSN, afinado para el scoring de mutaciones puntuales en hidrolasas de PET (PETasas) en el contexto del proyecto PET-Flow. Lo publica el usuario GinnM en Hugging Face y no es un modelo de lenguaje: a pesar del nombre "ProSST", el archivo contiene exclusivamente los pesos de la GNN ProtSSN con arquitectura `egnn` / `k20_h512`, y debe cargarse con código compatible con ProtSSN.

El modelo resuelve un problema muy concreto de ingeniería de proteínas: dado un PDB de la proteína silvestre, puntuar las 19 sustituciones no nativas en cada residuo retenido, usando la secuencia y la estructura como entrada. Se apoya en un encoder de lenguaje de proteínas congelado (`facebook/esm2_t33_650M_UR50D`) que se carga por separado, y la GNN se entrena sobre un objetivo combinado de pérdida de correlación de actividad, cross-entropy de masked language modeling y supervisión de ranking explícita sobre 20 mutantes medidos de PETasa.

Es relevante ahora porque ejemplifica el patrón de publicación de checkpoints de biología computacional en Hugging Face: pesos pequeños (unos 565 MiB), dependencia fuerte del repositorio upstream y un alcance de evaluación muy limitado (las 20 mutaciones de entrenamiento), lo que obliga a leer la model card con cuidado antes de reutilizarlo. La licencia no está declarada, lo que condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ProtSSN EGNN (equivariant graph neural network), 6 capas, 512 canales ocultos |
| Parametros totales | no disponible (el archivo pesa 592.418.469 bytes, unos 565 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; vecindad de grafo k = 20) |
| Tipos de cuantizacion | no disponible (checkpoint nativo PyTorch `state_dict`, sin versiones cuantizadas) |
| Idiomas soportados | en (etiqueta de la model card; el modelo opera sobre secuencias de aminoácidos, no sobre texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`state_dict` de la GNN), archivo `ProSST-Evotuned.pt` |
| Encoder asociado | `facebook/esm2_t33_650M_UR50D` (congelado, se carga por separado) |
| Entrada | Estructura PDB de proteína silvestre |
| Salida | Puntuaciones para las 19 sustituciones no nativas en cada residuo retenido |
| Vecindad de grafo | k = 20 |
| Repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La red es una EGNN de ProtSSN con 6 capas y 512 canales ocultos, que opera sobre un grafo de residuos construido con vecindad k = 20 a partir de la estructura PDB. La secuencia y la estructura se codifican mediante ESM2 (`esm2_t33_650M_UR50D`) congelado, que se carga de forma independiente; el checkpoint publicado contiene únicamente los parámetros de la GNN, sin pesos de ESM2, sin estadísticas de normalización del grafo, sin estado del optimizador ni metadatos de entrenamiento. Por tanto, la inferencia exige el repositorio upstream de ProtSSN (incluyendo `src/` y `norm/`) y una GPU CUDA con el script de inferencia actualizado de PET-Flow.

El afinado parte de un checkpoint ProtSSN previamente entrenado con masked language modeling sobre estructuras proteicas. El ajuste posterior usó 20 etiquetas medidas de actividad de mutantes simples de PETasa ("Activity at 50 °C (%)"), masked language modeling auxiliar sobre 2.308 estructuras proteicas elegibles, y un objetivo combinado con pérdida de correlación de Pearson de actividad, cross-entropy de tokens enmascarados y supervisión de ranking explícita para las 20 identidades de mutación seleccionadas. Se entrenaron todos los parámetros de la EGNN con el encoder ESM2 congelado y sin cabeza de regresión separada, durante 5 épocas y 185 actualizaciones del optimizador, seleccionando el checkpoint de la época 5. La puntuación por sustitución se define como `log P(mutante | secuencia y estructura WT) - log P(WT | secuencia y estructura WT)`.

## Capacidades

- Predicción del efecto de mutaciones puntuales en PETasas a partir de secuencia y estructura silvestre.
- Generación de una matriz de saturación de mutagénesis: 19 sustituciones no nativas por cada residuo retenido, excluyendo la sustitución propia.
- Scoring basado en estructura mediante grafo de residuos con vecindad k = 20.
- Integración con el flujo PET-Flow para reproducir el pipeline de scoring (`prot_ssn.py`).
- Uso de ESM2 congelado como encoder de secuencia y estructura, con posibilidad de apuntar a una copia local mediante `--plm`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre: no es un modelo de lenguaje.
- No puntúa directamente variantes combinatorias (multimutantes); el flujo es de sitio único.

## Casos de uso

- Reproducción del flujo de scoring de PET-Flow: cargar el checkpoint con `--gnn_checkpoint weights/ProSST-Evotuned.pt` y generar un CSV de saturación (`mutant`, `ProtSSN_k20_h512`) para comparar con los resultados publicados del proyecto.
- Priorización de mutantes en ingeniería de PETasas: usar las puntuaciones relativas para ordenar candidatos antes de ensayos experimentales, teniendo en cuenta que las puntuaciones no son probabilidades calibradas ni porcentajes de actividad.
- Análisis estructural de tolerancia a mutaciones: identificar residuos donde el modelo prefiere fuertemente la identidad silvestre frente a sustituciones, como señal para descartar posiciones en campañas de mutagénesis.
- Docencia y formación en biología computacional: ejemplo práctico de EGNN sobre grafos de residuos con encoder ESM2 congelado y objetivo de ranking, útil para explicar pipelines de mutation-effect prediction.
- Benchmark interno de métodos de scoring: comparar las puntuaciones de este checkpoint con otros modelos de efecto de mutación sobre el mismo PDB y la misma tabla de mutaciones.
- Integración en pipelines de laboratorio seco: generar CSV de saturación que alimenten scripts de selección de variantes, con la advertencia de que las predicciones para mutaciones nuevas requieren validación independiente.
- Verificación de integridad y trazabilidad: comprobar el SHA-256 del checkpoint antes de desplegarlo en un entorno de producción o de replicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que la evaluación se realizó sobre la misma tabla de mutaciones usada en entrenamiento y que las identidades candidatas se incluyeron explícitamente en el objetivo de ranking; por tanto, las correlaciones reportadas miden ajuste a los datos de entrenamiento y no generalización a datos no vistos. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes, que además no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint de la GNN ocupa unos 565 MiB y el encoder ESM2 de 650M parámetros se carga aparte, por lo que se necesita VRAM adicional para ESM2 y para el grafo.
- GPU recomendadas: la model card exige una GPU CUDA; no se especifican modelos concretos.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; por el tamaño del checkpoint y del encoder ESM2 es plausible en GPUs consumer con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegue: script `prot_ssn.py` de PET-Flow junto con el repositorio upstream de ProtSSN (`src/`, `norm/`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencias: `huggingface-hub>=1.0` para la descarga, PyTorch, CUDA y el código de ProtSSN.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / vecindad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProSST-Evotuned (GinnM) | EGNN ProtSSN afinada para PETasa | no disponible (checkpoint de ~565 MiB) | k = 20 en grafo de residuos | no disponible | Hugging Face, requiere ProtSSN upstream |
| ProtSSN (ai4protein) | EGNN base para scoring estructural | no disponible | k configurable (aquí k = 20) | no disponible en la informacion | GitHub upstream |
| ESM2 `esm2_t33_650M_UR50D` (Meta) | Modelo de lenguaje de proteínas | 650M | no aplica (secuencia) | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a tipo, arquitectura y disponibilidad.

## Limitaciones y advertencias

- El nombre "ProSST" es engañoso: el archivo contiene pesos de GNN ProtSSN, no un modelo ProSST, y debe cargarse con código compatible con ProtSSN.
- El checkpoint contiene solo los parámetros de la GNN; sin ESM2, sin estadísticas de normalización, sin estado del optimizador y sin metadatos de entrenamiento, la inferencia no es autocontenida.
- La evaluación se hizo sobre la misma tabla de 20 mutaciones usada en entrenamiento, con las identidades candidatas incluidas en el objetivo de ranking; no hay evidencia de generalización a mutaciones, proteínas o combinaciones nuevas.
- Las puntuaciones son preferencias relativas del modelo, no porcentajes de actividad, temperaturas de fusión ni probabilidades calibradas de mejora experimental.
- El flujo de sitio único no puntúa directamente variantes combinatorias.
- Los nombres de mutación (`A1V`) usan posiciones 1-based sobre la secuencia derivada de la estructura retenida, que pueden diferir de la numeración original del PDB cuando faltan residuos o se excluyen.
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- No hay datos publicados de sesgos, alucinación en sentido lingüístico ni cobertura multilingüe; el modelo no genera texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, lo que reduce la señal de validación por parte de la comunidad.
- En producción, cualquier predicción debe validarse experimentalmente de forma independiente antes de tomar decisiones de ingeniería de proteínas.

## Enlaces

- Hugging Face: https://huggingface.co/GinnM/ProSST-Evotuned
- PET-Flow (scripts y datos): https://github.com/pet-flow815/petflow
- Instalación de PET-Flow: https://github.com/pet-flow815/petflow#installation
- ProtSSN (arquitectura upstream e inferencia): https://github.com/ai4protein/ProtSSN
- Encoder ESM2: https://huggingface.co/facebook/esm2_t33_650M_UR50D
