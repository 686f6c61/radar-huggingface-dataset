# remilia495/sepal-ppi

## Resumen

SEPAL-PPI es un conjunto de checkpoints para la predicción de interacciones proteína-proteína (PPI) en plantas, publicado por el usuario remilia495 bajo licencia Apache 2.0. El repositorio no contiene un modelo de lenguaje generativo, sino los pesos de un predictor supervisado que opera sobre embeddings precalculados del modelo ESM2-15B y sobre características estructurales de residuos (RSA corregida y estructura secundaria en tres estados, Q3). El paquete principal es la versión corregida denominada BPP, distribuida bajo el directorio `sepal-stCore24/` en varios bundles según la precisión con la que se generaron los embeddings de entrada.

El repositorio incluye además un directorio histórico `sepal-st50/` que conserva el modelo ST50 original por motivos de reproducibilidad y compatibilidad con la CLI `onestep-sepal-ppi==0.9.1`. El autor advierte explícitamente de que las predicciones obtenidas a través de esa CLI corresponden al modelo ST50 heredado y no al predictor BPP corregido, por lo que no deben presentarse como resultados del modelo actualizado.

La relevancia de este artefacto es acotada y muy específica: sirve a equipos de biología computacional vegetal que ya dispongan de embeddings ESM2-15B y quieran reutilizar un cabezal de predicción PPI calibrado, con opciones de inferencia directa o reentrenamiento sobre embeddings cuantizados a INT8 e INT4. No es un modelo autónomo de propósito general y no incluye el backbone ESM2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Predictor supervisado de dos ramas (rama CIS y rama de residuos) sobre embeddings ESM2-15B; el backbone ESM2 no se incluye en el repositorio |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Referidos a la extracción de embeddings upstream: BF16, INT8, INT4 (el modelo en sí se distribuye en pesos PyTorch) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (cinco ficheros de pesos por bundle: capa de compresión de residuos y checkpoint y capa de entrada de cada rama) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un ensamblado de dos ramas: una rama CIS y una rama de residuos, cada una con su propio checkpoint y capa de entrada, más una capa de compresión de residuos compartida aguas arriba. Cada bundle standalone contiene exactamente cinco ficheros de pesos PyTorch que deben cargarse conjuntamente desde el mismo bundle, junto con las configuraciones de arquitectura incluidas. La rama de residuos consume características de RSA corregida y estructura secundaria Q3. Las predicciones de ambas ramas se combinan linealmente con los coeficientes especificados en `ensemble/inference.json`; para obtener una probabilidad calibrada se aplica una sigmoide al logit combinado dividido por la temperatura indicada.

El entrenamiento se realiza sobre embeddings generados por ESM2-15B. El repositorio ofrece cuatro rutas según la precisión de esos embeddings: un modelo completo entrenado con embeddings BF16, dos variantes reentrenadas específicamente sobre embeddings INT8 e INT4, y dos opciones de inferencia directa (INT8-direct e INT4-direct) que emplean el modelo completo pero requieren descargar los pesos de `bf16/`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Se incluyen digests SHA256 de los checkpoints en `sepal-stCore24/SHA256SUMS`.

## Capacidades

- Predicción de interacciones proteína-proteína en plantas mediante clasificación binaria a partir de embeddings ESM2-15B y características estructurales de residuos.
- Ranking de pares de proteínas mediante la combinación de los logits de las dos ramas con los coeficientes del ensemble.
- Calibración de probabilidades mediante sigmoide sobre el logit combinado dividido por la temperatura reportada.
- Inferencia directa con el modelo completo sobre embeddings cuantizados a INT8 o INT4.
- Reentrenamiento o ajuste del cabezal sobre embeddings INT8 e INT4 mediante los bundles específicos.
- Compatibilidad con la CLI `onestep-sepal-ppi==0.9.1` para el modelo histórico ST50.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Análisis de interactomas vegetales: el predictor permite puntuar pares de proteínas de una especie vegetal a partir de embeddings ESM2-15B ya calculados, priorizando candidatos antes de validación experimental.
- Filtrado previo en pipelines de biología estructural: combinado con las características RSA y Q3, el modelo aporta una señal complementaria a métodos basados en estructura para descartar pares improbables.
- Reutilización de infraestructura de embeddings existente: equipos que ya generan embeddings ESM2-15B en BF16 pueden cargar el bundle `bf16` y obtener predicciones sin reentrenar nada.
- Despliegue en entornos con memoria limitada: los bundles `int8-retrained` e `int4-retrained` permiten trabajar con embeddings cuantizados, reduciendo el coste de almacenamiento y de extracción upstream.
- Reproducibilidad de resultados históricos: el directorio `sepal-st50/` permite replicar predicciones antiguas generadas con la CLI 0.9.1, identificándolas correctamente como ST50 heredado.
- Integración en servicios de anotación funcional: el modelo puede exponerse como paso de scoring dentro de un servicio que reciba embeddings y características de residuos y devuelva probabilidades calibradas.
- Auditoría de modelos previos: la separación entre ST50 y BPP facilita comparar el comportamiento del predictor histórico frente al corregido sobre el mismo conjunto de pares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 1,2 GB, pero el coste real de inferencia depende de generar los embeddings ESM2-15B, que no se incluyen y dominan el consumo de VRAM.
- VRAM para el predictor: no disponible de forma explícita; los cinco ficheros de pesos por bundle son ligeros en comparación con el backbone.
- VRAM para ESM2-15B (dependencia externa): no disponible en la información proporcionada; requiere planificación aparte según la precisión (BF16, INT8, INT4).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende fundamentalmente del backbone ESM2-15B, no del predictor.
- Opciones de despliegue: carga directa de pesos PyTorch con las configuraciones de arquitectura incluidas; CLI `onestep-sepal-ppi==0.9.1` para el modelo ST50. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de predicción PPI en plantas ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene el backbone ESM2; sin embeddings ESM2-15B generados externamente el predictor no es utilizable.
- La CLI `onestep-sepal-ppi==0.9.1` lee por defecto `sepal-st50/<precision>/`, que contiene el modelo ST50 histórico; sus predicciones no deben atribuirse al predictor BPP corregido.
- Los cinco ficheros de pesos de un bundle deben cargarse siempre del mismo bundle; mezclar ficheros de bundles distintos invalida los resultados.
- El checkpoint combinado de residuos, el scaler y el meta-learner del layout `sepal-st50/` no forman parte de los bundles BPP corregidos.
- Los sufijos INT8 e INT4 se refieren a la extracción de embeddings upstream, no a una cuantización del propio predictor; usar el bundle equivocado para una precisión de embeddings dada degrada las predicciones.
- No se documentan sesgos, tasas de alucinación ni cobertura taxonómica; el ámbito declarado es plantas, y su uso fuera de ese dominio no está validado en la información disponible.
- No se especifican los idiomas ni dominios de aplicación más allá del biológico; no es un modelo de lenguaje y no debe emplearse como tal.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de ESM2-15B impone revisar por separado la licencia de ese backbone.
- No hay métricas publicadas de calibración, precisión o recall en la información disponible, pese a que el modelo reporta probabilidades calibradas por temperatura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/remilia495/sepal-ppi
- Directorio del modelo corregido: https://huggingface.co/remilia495/sepal-ppi/tree/main/sepal-stCore24
- Bundle BF16: https://huggingface.co/remilia495/sepal-ppi/blob/main/sepal-stCore24/bf16/bundle.json
- Bundle INT8 reentrenado: https://huggingface.co/remilia495/sepal-ppi/blob/main/sepal-stCore24/int8-retrained/bundle.json
- Bundle INT4 reentrenado: https://huggingface.co/remilia495/sepal-ppi/blob/main/sepal-stCore24/int4-retrained/bundle.json
- Bundle INT8 directo: https://huggingface.co/remilia495/sepal-ppi/blob/main/sepal-stCore24/int8-direct/bundle.json
- Bundle INT4 directo: https://huggingface.co/remilia495/sepal-ppi/blob/main/sepal-stCore24/int4-direct/bundle.json
- Digests de checkpoints: https://huggingface.co/remilia495/sepal-ppi/blob/main/sepal-stCore24/SHA256SUMS
- Aviso del directorio histórico ST50: https://huggingface.co/remilia495/sepal-ppi/blob/main/sepal-st50/README.md
- Snapshot histórico ST50: https://huggingface.co/remilia495/sepal-ppi/tree/legacy-st50/sepal-st50
