# dinghhhhhhhhhhhhhhh/CPDD-147M

## Resumen

CPDD-147M es un modelo de difusión discreta bidireccional para la restauración de regiones de ADN de longitud fija a partir de contexto flanqueante. Lo publica el usuario dinghhhhhhhhhhhhhhh y los pesos se atribuyen a CreatiPhage Biotechnology Co., Ltd. No es un modelo de lenguaje: su dominio es la genómica, concretamente la reconstrucción de fragmentos enmascarados de secuencias de ADN, con aplicación declarada en genomas de bacteriófagos.

El modelo resuelve un problema acotado y bien definido: dado un contexto de secuencia a ambos lados de una región enmascarada, predice los nucleótidos de esa región. La restauración es de longitud fija, sin inserciones ni deleciones. Esta restricción simplifica el problema frente a tareas de ensamblaje o edición génica y encaja con un esquema de difusión discreta sobre un alfabeto de nucleótidos.

Con 147.468.214 parámetros y una longitud de contexto declarada de 98.304 tokens, el modelo se sitúa en la gama media de tamaño pero con una ventana de contexto muy amplia para datos genómicos. Su relevancia actual es la de una herramienta de investigación especializada: los pesos están publicados en safetensors FP32, la licencia es CC BY 4.0 y el código asociado es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusión discreta bidireccional (no transformer autorregresivo) |
| Parametros totales | 147.468.214 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 98.304 tokens |
| Tipos de cuantizacion | no disponible; pesos publicados en FP32 |
| Idiomas soportados | no aplica (modelo de secuencias de ADN) |
| Licencia | CC BY 4.0 (pesos), Apache-2.0 (código) |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de difusión discreta bidireccional. A diferencia de un transformer autorregresivo, el modelo no genera la secuencia de izquierda a derecha, sino que parte de una región totalmente enmascarada y la va denoizando de forma iterativa, condicionado por el contexto flanqueante. El proceso de decodificación admite al menos `argmax` y un número configurable de pasos (`--steps` en el ejemplo de la model card, con valor 6). El carácter bidireccional es coherente con la tarea: los nucleótidos de la región a restaurar dependen tanto del contexto anterior como del posterior.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo etapas de ajuste fino con preferencias (RLHF/DPO), algo esperable en un modelo de este dominio. Tampoco se especifica la innovación técnica concreta del proceso de difusión más allá de su naturaleza discreta y bidireccional. Todo ello debe considerarse no disponible a partir de la información publicada.

## Capacidades

- Restauración de regiones de ADN de longitud fija a partir de contexto flanqueante, con la región objetivo enmascarada.
- Decodificación iterativa configurable mediante número de pasos de difusión.
- Modos de decodificación: al menos `argmax` (el ejemplo de la model card); otros modos no documentados.
- Ejecución en CPU según el ejemplo oficial (`--device cpu`), además de GPU presumiblemente.
- Dominio declarado: genómica y ADN de bacteriófagos (tags `genomics`, `dna`, `phage`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No es multilingüe ni procesa texto natural: opera sobre alfabeto de nucleótidos.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Reconstrucción de fragmentos enmascarados en genomas de fagos: dado un contexto a ambos lados de una región desconocida, el modelo predice los nucleótidos faltantes, útil en análisis de genomas virales donde hay huecos de secuenciación.
- Completado de regiones en pipelines de anotación genómica: antes de anotar genes, se pueden rellenar regiones con baja cobertura para estabilizar las predicciones de herramientas posteriores.
- Generación de hipótesis en biología computacional: el modelo produce secuencias candidatas que luego se validan experimentalmente, no al contrario.
- Estudio de variantes y contextos: comparar la restauración del modelo con la secuencia real permite detectar regiones inusuales o mutaciones candidatas.
- Docencia y prototipado en genómica computacional: al ejecutarse en CPU y con un repo de 0,6 GB, sirve para experimentar con modelos de difusión aplicados a ADN sin infraestructura pesada.
- Integración en flujos de preprocesado de datos de secuenciación: como paso de imputación controlada de regiones fijas antes de análisis downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en FP32 de 147,5 M de parámetros: aproximadamente 590 MB en disco y en memoria, coherente con el tamaño del repo (0,6 GB).
- Inferencia en CPU viable según el ejemplo oficial (`--device cpu`), adecuada para pruebas y secuencias cortas.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU consumer con al menos 2-4 GB de VRAM libre debería alojar los pesos en FP32, aunque no hay datos oficiales.
- Cabe en GPU consumer (RTX 3060, RTX 4090, etc.) con holgura por el reducido número de parámetros.
- Opciones de despliegue: el código propio del repositorio (PyTorch); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CPDD-147M | 147,5 M | 98.304 | Difusión discreta para restauración de ADN | CC BY 4.0 (pesos) | Hugging Face |
| CreatiPhage-145M | 145 M (según nombre) | no disponible | Modelo de lenguaje de ADN del mismo autor | no disponible | Hugging Face |
| Otros modelos genómicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La única alternativa directamente identificable en la información disponible es CreatiPhage-145M, del mismo autor, que parece ser un modelo de lenguaje de ADN complementario al de difusión. No se dispone de datos de rendimiento para comparar ninguno de los dos.

## Limitaciones y advertencias

- La restauración es de longitud fija: no modela inserciones ni deleciones, lo que limita su uso en tareas de edición o ensamblaje.
- Los resultados son predicciones computacionales, no validación biológica; la model card lo advierte explícitamente.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre su composición, lo que impide evaluar cobertura taxonómica o de dominios.
- Riesgo de alucinación en el sentido de generar secuencias plausibles pero biológicamente incorrectas; en genómica, esto puede propagarse a análisis downstream.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribución a CreatiPhage Biotechnology Co., Ltd.; el código es Apache-2.0, con condiciones distintas.
- El modelo requiere el código acompañante (PyTorch); no es desplegable con runtimes estándar de LLM.
- Sin descargas ni likes en el momento de la consulta y sin benchmarks publicados: madurez y validación externa desconocidas.
- Idiomas y contexto en tokens de ADN: la ventana de 98.304 tokens debe interpretarse en el alfabeto de nucleótidos, no en tokens de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dinghhhhhhhhhhhhhhh/CPDD-147M
- Código: https://github.com/dhnihaoya/CreatiPhage-Diffusion-DNA-Lm
- Informe técnico (PDF): https://github.com/dhnihaoya/CreatiPhage-Diffusion-DNA-Lm/blob/main/paper/CPDD_technical_report.pdf
- Modelo relacionado CreatiPhage-145M: https://huggingface.co/dinghhhhhhhhhhhhhhh/CreatiPhage-145M
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia del código (Apache-2.0): https://github.com/dhnihaoya/CreatiPhage-Diffusion-DNA-Lm/blob/main/LICENSE
