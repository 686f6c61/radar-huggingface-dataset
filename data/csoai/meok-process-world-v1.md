# csoai/meok-process-world-v1

## Resumen

MEOK experimental process-world predictor v0 es un modelo de regresión tabular entrenado con scikit-learn que predice el siguiente estado agregado de selección de proveedores dentro de un proceso de compras sintético y declarado. Lo desarrolla el usuario csoai (CSOAI-ORG) como componente experimental derivado de su motor de ensayo sintético `councilof-ai`. No es un modelo fundacional, no es un ajuste fino de NVIDIA Cosmos y no sustituye al simulador determinista exacto del que se extrajo.

El modelo es una red neuronal MLP de dos capas ocultas (32 y 16 unidades) con 980 parámetros aprendidos, seleccionada entre 14 variantes candidatas (nueve redes neuronales con distintas semillas y tamaños, ridge, extra-trees, persistencia, ensemble de salida y un híbrido restringido). Se entrenó sobre 320 episodios sintéticos (2.560 transiciones) generados por el motor fijado en un commit concreto, con partición de 200 episodios de entrenamiento, 50 de validación y 70 de test reservados.

Su relevancia es metodológica más que práctica: sirve como ejemplo medido de cómo combinar una aproximación aprendida con estructura conocida (proyección sobre el símplex y regla de expiración de permisos) y de cómo publicar pesos portables verificables por hash sin depender de un framework de inferencia. El propio autor advierte que no está cualificado para decidir acciones y que no se ha demostrado ventaja alguna de velocidad o precisión frente al motor determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de dos capas ocultas (32 y 16 unidades), seleccionada entre 14 variantes (redes 8, 16 y 32→16 con semillas 7, 17 y 29; ridge; extra-trees; persistencia; ensemble de salida; híbrido restringido) |
| Parametros totales | 980 parámetros aprendidos (modelo seleccionado mlp-32-16-seed17) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular de 11 características; no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos exportados en JSON portable; sin cuantización publicada) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | JSON (`weights.json`) con verificación SHA-256; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa de regresión tabular, no un transformer. Recibe un vector de 11 características (según el ejemplo de la model card: `[0,0,0,1,0.3,0.4,0.3,0,1,1,0]`) y produce cuatro componentes de estado que representan proporciones agregadas de selección de proveedores. La variante seleccionada, `mlp-32-16-seed17`, tiene dos capas ocultas de 32 y 16 unidades y 980 parámetros. La selección se hizo por MAE de validación, no por resultados de test.

El entrenamiento se ejecutó en un job de CPU de Hugging Face sobre 320 episodios sintéticos (2.560 transiciones): 200 episodios (1.600 filas) de entrenamiento, 50 (400 filas) de validación y 70 (560 filas) de test reservado. Los datos provienen del motor `CSOAI-ORG/councilof-ai` fijado en el commit `4070aa6d3140ba10226677840f4873fbedd2467e`; no se usaron pesos preentrenados ni salidas de modelos de terceros. El entorno de reproducción es Python 3.12, numpy 2.2.6, scipy 1.15.3 y scikit-learn 1.7.2.

La innovación destacable no es arquitectónica sino de empaquetado y validación: los pesos se exportan a JSON y se replican de forma independiente con la biblioteca estándar de Python sobre las 560 filas de test, rechazando digest mismatch, entradas malformadas y valores no finitos. El híbrido restringido aplica una regla conocida cuando el permiso de simulación ha expirado y, en caso contrario, proyecta las predicciones sobre proporciones no negativas que suman uno.

## Capacidades

- Predicción del siguiente estado agregado de selección de proveedores (cuatro componentes) a partir de un vector tabular de 11 características.
- Regresión tabular sobre datos sintéticos de un proceso de compras declarado.
- Inferencia sin framework de modelo: ejecutable con `predict.py` y la biblioteca estándar de Python.
- Verificación de integridad de pesos mediante SHA-256 esperado.
- Salida etiquetada explícitamente como `MODEL_PREDICTION_NOT_OBSERVED`.
- Proyección sobre el símplex (proporciones no negativas que suman uno) en la variante híbrida.
- Aplicación de regla de expiración de permisos de simulación en la variante híbrida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible (solo en).

## Casos de uso

- Docencia y demostración de modelado de mundo tabular: el modelo sirve para ilustrar cómo se entrena un predictor de transiciones sobre un simulador sintético y cómo se comparan 14 variantes con métricas de validación y test separadas.
- Ejemplo reproducible de exportación portable de pesos: útil en entornos con restricciones de dependencias, ya que los pesos JSON se replican con la biblioteca estándar y se validan por hash sin instalar PyTorch ni transformers.
- Estudio de combinación aprendido-estructurado: el híbrido restringido (proyección al símplex más regla de expiración) es un caso medido de cómo incorporar restricciones conocidas a una predicción neuronal, apropiado para investigar métodos híbridos.
- Auditoría de integridad de artefactos: el flujo de digest SHA-256 y rechazo de entradas malformadas o no finitas puede reutilizarse como patrón en pipelines de validación de modelos experimentales.
- Pruebas de regresión de infraestructura de simulación: el modelo puede actuar como oráculo aproximado en tests de integración del motor `councilof-ai`, siempre que el motor determinista siga siendo la referencia autoritativa.
- Reproducción de experimentos con particiones fijas: útil para verificar que un pipeline de entrenamiento respeta la separación train/validation/test y que cualquier optimización futura sobre el test publicado exige un nuevo conjunto de evaluación intacto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre las 560 filas de test reservado. Los errores son fracciones de población sintética, promediados sobre cuatro componentes de estado.

| Variante | MAE en test | Peor error absoluto por componente |
|---|---:|---:|
| Neuronal seleccionada (mlp-32-16-seed17) | 0,006131327 | 0,837697423 |
| Neuronal + proyección al símplex + regla de expiración conocida | 0,002879733 | 0,749907660 |
| Ensemble de salida de nueve redes | 0,009127069 | 0,357089498 |

El autor subraya que un promedio pequeño no implica predicciones individuales fiables: el híbrido restringido mantiene un peor error por componente cercano a 0,75. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo tiene 980 parámetros y los pesos se cargan desde un JSON de tamaño mínimo.
- GPU recomendadas: no aplica; el entrenamiento se ejecutó en un job de CPU de Hugging Face y la inferencia es viable en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `predict.py` con la biblioteca estándar de Python; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones. El autor indica que no se ha establecido ventaja de velocidad frente al motor determinista exacto.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (predictores de mundo tabulares sintéticos derivados de un simulador de compras). El propio autor descarta explícitamente la comparación con NVIDIA Cosmos y con modelos fundacionales de mundo físico.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MEOK process-world v1 | 980 | no aplica | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo fundacional ni un modelo de chat: solo predice estados agregados en un dominio sintético de compras declarado.
- El motor determinista exacto sigue siendo la referencia autoritativa; no se ha demostrado ventaja de precisión ni de velocidad frente a él.
- Un MAE medio bajo no garantiza fiabilidad por predicción: el peor error por componente ronda 0,75 en la variante híbrida.
- El modelo no está cualificado para decidir acciones.
- Utiliza proporciones completas del perfil del simulador (observación privilegiada); la generalización a observación parcial, dominio físico y dominio de cliente no se ha probado.
- Los permisos del fixture sintético son controles lógicos de simulación, no aprobaciones humanas autenticadas.
- No se reclama ninguna puntuación canónica GSPC, credencial de seguridad, resultado de cliente ni resultado físico fotónico o cuántico.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de extrapolación no validada fuera de la distribución sintética de entrenamiento.
- Sesgos conocidos: no disponibles; al ser datos sintéticos, los sesgos del generador no se han caracterizado.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo es un candidato de investigación sin validación de producción.
- Cualquier optimización futura contra el conjunto de test publicado exige un nuevo conjunto de evaluación intacto.
- Los pesos son salidas experimentales nuevas de CSOAI y no contienen pesos de NVIDIA Cosmos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csoai/meok-process-world-v1
- Dataset de transiciones: https://huggingface.co/datasets/csoai/meok-process-world-transitions-v0
- Fuente canónica del motor: https://github.com/CSOAI-ORG/councilof-ai/tree/1571ac990bb954f37a8e21d7677c11d33172d73b/harness/meok-process-lab
- Commit del motor usado en entrenamiento: `4070aa6d3140ba10226677840f4873fbedd2467e`
- Job de entrenamiento en CPU de Hugging Face: `csoai/6af27aba9737d9a9e08ea042`
