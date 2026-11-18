# GazeEzio/k562-state-hallmark-mapper

## Resumen

k562-state-hallmark-mapper es un conjunto de cabezas de lectura (readout heads) congeladas publicadas por el usuario GazeEzio, diseñadas para los experimentos `train_calibrated_tool_routed_fusion` de AlphaApollo. Cada cabeza toma un vector de delta de expresión génica de 2.000 características procedente del modelo STATE sobre la línea celular K562 y lo transforma en diferencias medias con signo de AUCell para las 50 dianas Hallmark de PerturbHD. No es un modelo generativo ni un LLM: es un artefacto estadístico de regresión Ridge multi-salida con fines de investigación en biología computacional.

El artefacto se distribuye como ficheros NumPy (`.npz`) con los coeficientes, interceptos, estadísticas del `StandardScaler` y los identificadores de características y de dianas Hallmark. Existe una cabeza ajustada por cada split oficial de PerturbHD; cada una se entrena sobre la partición TRAIN de su split, aplica el escalado original y ajusta una regresión Ridge multi-salida. El split 1 es la cabeza exacta empleada en los experimentos K562 Dev10.

Su relevancia es acotada y muy específica: sirve como fuente de lectura congelada dentro de un pipeline de evaluación de perturbaciones genéticas, no como componente de propósito general. El repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB, y la model card no declara licencia ni idiomas, lo que limita su uso fuera del contexto de investigación para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion Ridge multi-salida sobre caracteristicas estandarizadas (no es una red neuronal) |
| Parametros totales | no disponible (coeficientes e interceptos en ficheros `.npz`; no se declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 2.000 caracteristicas por perturbacion) |
| Tipos de cuantizacion | no disponible (pesos numericos en coma flotante dentro de `.npz`; no se documenta cuantizacion) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (NumPy, `allow_pickle=False`) junto con `mapper.py` y `manifest.json` |

## Arquitectura y entrenamiento

La cabeza es un modelo lineal multi-salida: un `StandardScaler` ajustado por split seguido de una regresion Ridge que proyecta 2.000 caracteristicas de delta de expresión del modelo STATE (checkpoint ST-HVG-Replogle) a 50 diferencias medias con signo de AUCell sobre las dianas Hallmark de MSigDB `2023.1.Hs`. El input de cada fila es la media de `X_hvg` predicho para la perturbacion menos la media de `X_hvg` predicho para el control non-targeting; la captura original usó ocho celulas predichas por perturbacion y 64 controles con semilla 42. La identidad del checkpoint fuente y de la captura se registra en `manifest.json`.

El entrenamiento se realizó por split oficial de PerturbHD (`replogle_k562_essential_full`), usando exclusivamente la partición TRAIN de cada uno. No se documenta número de tokens ni composición de dataset en el sentido de un LLM, ni RLHF/DPO. La verificación de exportación reprodujo exactamente 256.050 valores finitos de las cabezas originales en los tres splits y preservó las 299 filas no disponibles por split; además, el split 1 se contrastó contra 25.100 celdas de la caché congelada de puntuaciones Dev10 STATE, incluyendo entradas no disponibles. Estas comprobaciones validan la inferencia, no el rendimiento biológico, y no se reajustó ningún modelo para la exportación.

## Capacidades

- Mapeo de vectores de delta de expresión de 2.000 características a 50 puntuaciones Hallmark con signo.
- Soporte de entradas no disponibles: una perturbacion no soportada puede pasarse como fila completa de NaN y se devuelve una fila de salida completa de NaN, preservando su posición en la lista de candidatos.
- Verificación de identificadores de características: el cargador comprueba los `feature_ids` en orden de columna contra el eje de características fijado de STATE.
- Selección de split oficial mediante `official_split`, con la recomendación de mantener la elección fija a lo largo del episodio.
- Integración como fuente de lectura dentro del flujo de fusión (fusion workflow), que gestiona los pesos de fuente y las puntuaciones finales aguas abajo.
- Compatibilidad con el checkpoint ST-HVG-Replogle fijado por revisión (`bb6a9562cbbf1fd152df14cc53b4cc7517c77175`).
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.

## Casos de uso

- Evaluación de perturbaciones en K562: usar la cabeza del split correspondiente para obtener estimaciones de efecto Hallmark a partir de deltas de expresión predichos por STATE, manteniendo el split fijo para evitar fugas entre particiones.
- Benchmark de investigación PerturbHD: integrar la cabeza como fuente de lectura congelada dentro de `train_calibrated_tool_routed_fusion` para comparar el rendimiento de fuentes de predicción bajo un protocolo común.
- Reproducción de experimentos Dev10: emplear el split 1, que es la cabeza fuente exacta de los experimentos K562 Dev10, para replicar resultados previos.
- Análisis de vías Hallmark concretas: extraer una columna concreta (por ejemplo, `HALLMARK_ANGIOGENESIS`) mediante `mapper.hallmark_ids.index(...)` para estudiar la respuesta predicha en una vía específica.
- Manejo de perturbaciones no soportadas en pipelines mixtos: pasar filas NaN para perturbaciones sin cobertura y dejar que el flujo de fusión use las demás fuentes disponibles sin romper el alineamiento de la lista de candidatos.
- Auditoría de integridad de artefactos: verificar los digests SHA-256 de `manifest.json` y los identificadores de características y dianas antes de incorporar la cabeza a un pipeline de evaluación.
- Adaptación a otras líneas celulares o checkpoints: servir como plantilla metodológica (escalado más Ridge por split) para calificar una lectura equivalente con un checkpoint STATE, eje de características o línea celular distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta pruebas de verificación de exportación (reproducción exacta de 256.050 valores finitos y 299 filas no disponibles por split, y contraste del split 1 contra 25.100 celdas de la caché Dev10), que validan la inferencia y no el rendimiento biológico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es una regresión lineal cuyos coeficientes caben holgadamente en memoria de sistema, sin necesidad de GPU para la propia cabeza.
- GPU recomendadas: no aplica para la cabeza; la inferencia de STATE con el checkpoint ST-HVG-Replogle puede requerir GPU, pero no se documentan requisitos concretos.
- Cabe en GPU de consumo: sí para la cabeza (operaciones NumPy sobre matrices de 2.000 × 50); para STATE no disponible.
- Opciones de despliegue: carga directa con `mapper.py` (`load_mapper`) y NumPy con `allow_pickle=False`; no se contemplan vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; al ser una proyección lineal, el coste dominante será la inferencia de STATE, no la cabeza.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoría (cabezas de lectura congeladas STATE a Hallmark para PerturbHD) con los que establecer una comparación de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Es una cabeza específica de K562: para usar otro checkpoint STATE, otro eje de características u otra línea celular es necesario calificar una lectura equivalente.
- Las comprobaciones de exportación validan la reproducción de la inferencia, no el rendimiento biológico; no deben interpretarse como evidencia de calidad predictiva.
- Riesgo de alucinación no aplica en el sentido de un LLM, pero sí existe riesgo de extrapolación: la regresión Ridge puede producir estimaciones poco fiables fuera de la distribución de entrenamiento del split.
- La licencia no está declarada, lo que impide confirmar condiciones de uso comercial; debe tratarse como artefacto de investigación sin garantías.
- No se documentan sesgos, cobertura idiomática ni limitaciones de contexto por no ser un modelo de lenguaje.
- El flujo de fusión gestiona los pesos de fuente y las puntuaciones finales aguas abajo; usar la cabeza de forma aislada sin ese contexto puede llevar a interpretaciones erróneas de las salidas.
- Es imprescindible fijar la revisión de Hugging Face con `revision` al descargar y mantener el mismo split oficial durante toda la evaluación para evitar inconsistencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GazeEzio/k562-state-hallmark-mapper
- Checkpoint STATE de referencia (ST-HVG-Replogle, revisión fijada): https://huggingface.co/arcinstitute/ST-HVG-Replogle/tree/bb6a9562cbbf1fd152df14cc53b4cc7517c77175
- Datos y protocolo PerturbHD (commit fijado): https://github.com/snap-stanford/perturb-hd/tree/36620ca45f18fb088dd894cea5336744524dff0a
