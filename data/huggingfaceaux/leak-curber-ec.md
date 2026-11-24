# huggingfaceaux/leak-curber-ec

## Resumen

Leak CURBER enzyme classification es un sistema de predicción de números EC (Enzyme Commission) de cuatro niveles para secuencias de enzimas, publicado en Hugging Face por el usuario `huggingfaceaux` bajo el identificador `huggingfaceaux/leak-curber-ec`. No se trata de un modelo de lenguaje generativo, sino de un pipeline híbrido de clasificación que combina búsqueda por homología con MMseqs2 y un cabezal MLP sobre embeddings de ESM-2 8M. El objetivo es asignar una anotación EC completa (L1 a L4) a cada secuencia única de enzima, operando exclusivamente en CPU y en modo offline.

El sistema se apoya en una base de referencia de 186.488 secuencias de entrenamiento únicas y utiliza un voto k-NN ponderado por similitud sobre los 10 mejores hits de MMseqs2. Para las secuencias con coincidencias débiles o sin hit, recurre a embeddings de ESM-2 8M (modelo `facebook/esm2_t6_8M_UR50D`, licencia MIT) procesados por un MLP entrenado con etiquetas suaves 1/n, cuya salida softmax se fusiona con el voto de MMseqs2. El repositorio ocupa 0,1 GB y los pesos están en formato safetensors junto con artefactos auxiliares (`pt`, `json`).

La relevancia del sistema radica en su enfoque de anotación enzimática de bajo coste computacional: funciona sin GPU, con un pico de RAM de 1,6 GB y un tiempo de ejecución de 180 s nativos para 11.367 secuencias de validación. Los resultados declarados por el autor en un holdout con conciencia de similitud muestran precisiones de 0,753 (L4), 0,929 (L3), 0,941 (L2) y 0,961 (L1), muy superiores al baseline de EC más frecuente. El modelo está orientado a competiciones tipo leaderboard y a tareas de anotación funcional a escala moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: búsqueda por homología MMseqs2 + voto k-NN ponderado por similitud, con cabezal MLP sobre embeddings de ESM-2 8M para coincidencias débiles |
| Parametros totales | ESM-2 8M (aproximadamente 8 millones de parámetros) más el MLP de clasificación; el resto del sistema son artefactos de búsqueda, no parámetros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de secuencias, no generativo; ESM-2 8M tiene un límite de longitud de secuencia propio no especificado en la información) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; los pesos se distribuyen en safetensors y `pt`) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; opera sobre secuencias de aminoácidos) |
| Licencia | No disponible para el conjunto del repositorio; componentes internos con licencias explícitas: ESM-2 8M MIT, MMseqs2 GPLv3, vocabulario EC CC BY 4.0 |
| Formato de pesos | safetensors, `pt` (MLP), `json` (configuración y clases), base de referencia MMseqs2 en `weights/ref/` |

## Arquitectura y entrenamiento

El sistema no es un transformer generativo sino un clasificador en cascada. La primera etapa deduplica secuencias idénticas con la misma lógica del evaluador (`inputs.py`) y ejecuta MMseqs2 (release 19-ab57c, sensibilidad 5.7, 2 hilos) contra una base de referencia de 186.488 secuencias únicas de entrenamiento. Sobre los 10 mejores hits de cada entrada se calcula un voto de EC ponderado por similitud: `score(ec) = Σ bits² · [ec ∈ ECs(hit)] / |ECs(hit)|`. La segunda etapa entra en juego cuando el mejor hit queda por debajo del umbral de identidad o no existe: la secuencia se embebe con ESM-2 8M (mean-pooled) y un MLP entrenado con etiquetas suaves 1/n produce una distribución softmax que se fusiona con el voto de MMseqs2.

Los hiperparámetros (umbral de identidad, peso de fusión, k, potencia) están en `weights/config.json` y se seleccionaron sobre un holdout con conciencia de similitud: agrupamiento de entrenamiento al 50% de identidad con MMseqs2, retención de clústeres completos y reponderación para igualar la distribución de identidad train↔val. El sistema incorpora un guardián temporal que detiene la etapa ESM si la ejecución se acerca al límite de 15 minutos, y una reducción automática de sensibilidad para entradas grandes (más de 16.000 secuencias únicas) mediante `sensitivity_by_size`. Los fallbacks garantizan que siempre se escriba el fichero de salida, incluso si MMseqs2 o ESM fallan.

## Capacidades

- Predicción de un número EC de cuatro niveles por secuencia única de enzima, devolviendo entre 1 y 10 ECs distintos del vocabulario `ec_vocabulary.json`, ordenados de mejor a peor.
- Búsqueda por homología de alta sensibilidad contra una base de referencia de 186.488 secuencias mediante MMseqs2.
- Clasificación de secuencias con coincidencias débiles o sin hit mediante embeddings de ESM-2 8M y un cabezal MLP entrenado con etiquetas suaves.
- Funcionamiento exclusivamente en CPU y offline, sin dependencia de red ni de GPU.
- Ejecución por lotes desde línea de comandos: `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`.
- Robustez mediante fallbacks en cascada: ESM solo y, en último término, el EC más frecuente del entrenamiento.
- Gestión automática de entradas grandes mediante reducción de sensibilidad y guardián temporal.

## Casos de uso

- Anotación funcional de genomas y metagenomas: el sistema permite asignar números EC a miles de secuencias proteicas en una sola pasada de CPU, con 180 s nativos para 11.367 secuencias y un pico de RAM de 1,6 GB, lo que lo hace adecuado para servidores sin GPU.
- Enriquecimiento de bases de datos enzimáticas: dado un conjunto de secuencias con anotación incompleta, el pipeline puede completar los niveles L1 a L4 aprovechando la búsqueda por homología contra la referencia de 186.488 secuencias.
- Competiciones y evaluación tipo leaderboard: el diseño está explícitamente orientado a este escenario, con deduplicación idéntica a la del evaluador y un formato de salida JSONL que siempre se escribe, incluso ante fallos de MMseqs2 o ESM.
- Filtrado previo en pipelines de biología computacional: el modelo puede actuar como primera etapa de anotación para priorizar secuencias que luego se validen experimentalmente o con herramientas más costosas.
- Clasificación de enzimas con homología remota: la fusión de MMseqs2 con ESM-2 8M permite asignar EC a secuencias cuyo mejor hit queda por debajo del umbral de identidad, cubriendo casos que un k-NN puro no resolvería.
- Despliegue en entornos aislados: al funcionar offline y sin red, es adecuado para instalaciones con restricciones de seguridad o entornos air-gapped donde no se pueden descargar modelos en tiempo de inferencia.
- Procesamiento por lotes en contenedores: la invocación documentada con `--cpus 2 --memory 16g --network none --user 1000:1000` facilita su integración en pipelines de contenedores con recursos acotados.

## Benchmarks y rendimiento

| Métrica | L4 | L3 | L2 | L1 |
|---|---|---|---|---|
| Holdout con conciencia de similitud, reponderado a val (19.085 secuencias) | 0,753 | 0,929 | 0,941 | 0,961 |
| Baseline de EC más frecuente (starter) sobre el mismo holdout | 0,010 | 0,043 | 0,130 | 0,387 |

Datos de ejecución declarados por el autor: 403–456 s bajo emulación x86 en un Mac con Apple Silicon (180 s nativos) para 11.367 entradas únicas de validación, con `--cpus 2 --memory 16g --network none --user 1000:1000` y un pico de RAM de 1,6 GB. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el sistema está diseñado para ejecutarse exclusivamente en CPU.
- RAM: pico de 1,6 GB documentado para 11.367 secuencias únicas de validación.
- GPU recomendadas: no aplica; no se requiere GPU.
- ¿Cabe en consumer GPU? No aplica, al ser CPU-only.
- CPU: la configuración de referencia usa 2 hilos (`--cpus 2`); MMseqs2 se ejecuta con 2 threads según la model card.
- Opciones de despliegue: ejecución directa mediante `python /app/predict.py`; el repositorio incluye un Dockerfile que construye la base de datos MMseqs2 en tiempo de build. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de sistema.
- Latencia y throughput: 180 s nativos para 11.367 secuencias únicas; 403–456 s bajo emulación x86 en Apple Silicon. Para entradas de más de 16.000 secuencias únicas se reduce automáticamente la sensibilidad para respetar el límite de 15 minutos.

## Comparativa con modelos similares

| Sistema | Tipo | Referencia | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leak CURBER enzyme classification | MMseqs2 + ESM-2 8M + MLP | 186.488 secuencias de entrenamiento | 1–10 ECs por secuencia, 4 niveles | No disponible (componentes MIT, GPLv3, CC BY 4.0) | Hugging Face, 0 descargas, 0 likes |
| Baseline de EC más frecuente (starter) | Frecuencia prior | Entrenamiento del propio reto | Un EC por secuencia | No disponible | Incluido como referencia en la model card |
| MMseqs2 puro (k-NN sin ESM) | Búsqueda por homología | Base de referencia del sistema | Un EC por secuencia | GPLv3 | Herramienta pública |
| ESM-2 8M sin cabezal específico | Embeddings proteicos | `facebook/esm2_t6_8M_UR50D` | Representación, no clasificación EC directa | MIT | Hugging Face |

No se dispone de datos de benchmarks de sistemas externos comparables en la información proporcionada; la comparativa se limita a los componentes y baselines documentados por el autor.

## Limitaciones y advertencias

- El repositorio no declara licencia para el conjunto del sistema; solo se especifican las licencias de componentes internos (ESM-2 MIT, MMseqs2 GPLv3, vocabulario EC CC BY 4.0). Es necesario verificar los términos antes de un uso comercial.
- No se documentan sesgos conocidos, pero al ser un clasificador entrenado sobre una base de referencia concreta, su cobertura depende de la representatividad de esas 186.488 secuencias.
- Riesgo de asignaciones incorrectas en enzimas con homología remota: la etapa ESM-2 8M y el MLP actúan como respaldo, pero su precisión en esos casos es inferior a la de la búsqueda por homología directa.
- El sistema devuelve entre 1 y 10 ECs por secuencia; la primera predicción no es necesariamente la correcta, por lo que en producción conviene revisar el ranking completo.
- Límite temporal de 15 minutos: para entradas grandes se reduce automáticamente la sensibilidad, lo que puede degradar la calidad de la búsqueda por homología.
- Dependencia de la base de referencia: secuencias muy alejadas de las 186.488 de entrenamiento quedan cubiertas únicamente por el camino ESM-2 + MLP.
- El fallback final asigna el EC más frecuente del entrenamiento, lo que puede producir anotaciones genéricas y poco informativas en caso de fallo de MMseqs2 y ESM.
- No es un modelo generativo ni un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación independiente por parte de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/huggingfaceaux/leak-curber-ec
- ESM-2 8M (`facebook/esm2_t6_8M_UR50D`): https://huggingface.co/facebook/esm2_t6_8M_UR50D
- MMseqs2 (Steinegger & Söding, Nature Biotechnology 2017): https://github.com/soedinglab/MMseqs2
- ESM-2 (Lin et al., Science 2023): https://www.science.org/doi/10.1126/science.ade2574
- Vocabulario EC (ExPASy ENZYME, release 02-Sep-2026, SIB, CC BY 4.0): https://enzyme.expasy.org/
