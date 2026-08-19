# SeanWang0027/rlve-distill-scripts

## Resumen

El repositorio `SeanWang0027/rlve-distill-scripts` no contiene un modelo de IA, sino un conjunto de scripts y configuraciones para reproducir experimentos de destilación de modelos mediante RLVE (Reinforcement Learning with Verifiable Rewards). El autor, SeanWang0027, utiliza un modelo estudiante Qwen3-1.7B y compara tres métodos de destilación: OPD (Online Policy Distillation), ROSE online (una variante con teacher que continúa la generación) y ROSE iterativo (donde el estudiante se congela y se recolectan datos offline). El objetivo es estudiar cómo transferir conocimiento desde un teacher (Qwen3-4B-Thinking o Qwen3-32B según la fase) a un modelo pequeño mediante diferentes estrategias de pérdida y generación.

Este repositorio es relevante para investigadores interesados en destilación de modelos de razonamiento, especialmente en el contexto de modelos con pensamiento extendido (thinking mode). Incluye scripts de entrenamiento, evaluación, y herramientas de verificación de pesos, así como documentación detallada de los experimentos realizados entre agosto de 2026 y las fechas de creación. Aunque no es un modelo desplegable, proporciona una base reproducible para experimentar con técnicas de destilación en el ecosistema de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de scripts, no modelo) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (los scripts configuran contextos de hasta 32k tokens para rollouts) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (los scripts están en chino e inglés) |
| Licencia | No disponible |
| Formato de pesos | No aplica (contiene scripts, configuraciones y checkpoints intermedios) |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura de modelo propia, sino que organiza experimentos de destilación sobre el modelo estudiante Qwen3-1.7B. Los tres métodos comparados difieren en cómo se genera el rollout y dónde se aplica la pérdida:

- **OPD**: el estudiante genera su propia respuesta hasta `MAX_RESP_LENGTH` y el teacher (un reward model) puntúa cada token. La pérdida se aplica sobre toda la respuesta del estudiante.
- **ROSE online**: el estudiante escribe solo un prefijo de `CUT_FIXED` tokens y el teacher (un servidor vLLM independiente) continúa la generación durante `TEACHER_MAX_TOKENS` tokens. La pérdida solo se aplica en la parte continuada por el teacher.
- **ROSE iterativo**: el estudiante se congela y se recolectan 9000 prefijos completos; el teacher los continúa offline. Luego se entrena con SFT solo en la parte del teacher, y el estudiante resultante se usa en la siguiente iteración.

Los hiperparámetros clave son: learning rate `1e-5`, 70 pasos de entrenamiento para OPD y ROSE online, y 1 época por iteración para ROSE iterativo. La evaluación se realiza con contexto de 16k tokens (`CTX=18432`, `MAX_NEW=16384`, `N=8`, `TEMP=0.7`). El repositorio documenta un problema importante: el teacher por defecto en `bootstrap.sh` es Qwen3-4B-Thinking, no el 32B, lo que afecta a los resultados de ciertas líneas experimentales.

## Capacidades

- Reproducción de experimentos de destilación con tres metodologías distintas (OPD, ROSE online, ROSE iterativo).
- Entrenamiento de modelos Qwen3-1.7B con pérdida selectiva (solo en la parte generada por el teacher).
- Evaluación de modelos con rollouts de hasta 32k tokens y re-trunca exacta a presupuestos menores (16k) mediante `retrunc_eval.py`.
- Verificación de pesos de HuggingFace con `verify_hf_weights.py`.
- Soporte para servidores vLLM como teacher, con configuración de `max-model-len` para evitar errores 400.
- Herramientas de monitorización de GPU (`probe/`) y utilidades de fusión de resultados (`merge_eval.py`).
- Documentación de errores comunes y advertencias sobre la procedencia de checkpoints (algunos descargados de HuggingFace, no generados localmente).

## Casos de uso

- Investigación en destilación de modelos de razonamiento: permite comparar empíricamente tres estrategias de destilación sobre un mismo estudiante y teacher, útil para publicar estudios metodológicos.
- Reproducción de experimentos: los scripts están organizados por método (OPD, ROSE online, ROSE iterativo) y permiten replicar los resultados documentados en `results/`.
- Estudio del impacto del teacher en la destilación: el repositorio incluye experimentos con Qwen3-4B-Thinking y Qwen3-32B, lo que permite analizar cómo el tamaño del teacher afecta al rendimiento del estudiante.
- Desarrollo de pipelines de destilación con vLLM: el código de `bootstrap.sh` y `launchers/` muestra cómo integrar un servidor vLLM como teacher en un flujo de entrenamiento.
- Evaluación de modelos con presupuesto de tokens limitado: `retrunc_eval.py` permite re-evaluar rollouts largos con un presupuesto exacto, útil para aplicaciones donde la latencia o el coste son críticos.
- Formación en técnicas de RLVE: los scripts de `recipe/` contienen la lógica de agent loop y reward para ROSE online, sirviendo como referencia para implementar RLVE en otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un directorio `results/` con "snapshots" de resultados a 16k, pero los valores numéricos no se detallan en la model card. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM, pero al usar Qwen3-32B como teacher (en fases posteriores) se requiere una GPU con al menos 80 GB de VRAM (p. ej., A100 80GB o H100) para cargar el modelo en 16 bits o cuantizado.
- Para el estudiante Qwen3-1.7B, una GPU consumer como RTX 4090 (24 GB) es suficiente para inferencia y entrenamiento con batch pequeño.
- Los scripts de `probe/` sugieren que se monitorizó el uso de memoria y GPU durante los experimentos, lo que indica que se usaron GPUs de alta gama (probablemente A100 o H100).
- El despliegue del teacher como servidor vLLM requiere configurar `--max-model-len` adecuadamente (por ejemplo, 12288 tokens para K=4096) y `--max-seqs` para gestionar concurrencia.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, sino un conjunto de scripts de experimentación, por lo que no tiene comparación directa con modelos de IA. Los modelos resultantes (checkpoints) podrían compararse con Qwen3-1.7B base o con otros modelos destilados, pero no se proporcionan datos en la información disponible.

## Limitaciones y advertencias

- El repositorio es experimental y no está pensado para uso en producción; los scripts requieren adaptación y verificación antes de emplearlos en entornos reales.
- Existe un riesgo de confusión en la atribución del teacher: el valor por defecto en `bootstrap.sh` es Qwen3-4B-Thinking, no el 32B. Los resultados de líneas experimentales anteriores al 10 de agosto usan el teacher de 4B, y los posteriores usan el 32B. Es imprescindible revisar los logs para conocer el teacher real.
- Algunos checkpoints (como `models/opd_rlve_step70`) fueron descargados de HuggingFace y no son producto del entrenamiento local; usarlos como referencia puede invalidar comparaciones.
- La evaluación se basa en un presupuesto de 16k tokens, pero los rollouts pueden ser de 32k; la re-trunca exacta tiene una diferencia de aproximadamente 0.011 en la métrica, dentro del ruido, pero no es idéntica a una evaluación nativa de 16k.
- No se especifica la licencia del código ni de los checkpoints generados, lo que limita su uso comercial sin consultar al autor.
- El repositorio está documentado principalmente en chino, lo que puede dificultar su uso para desarrolladores no familiarizados con ese idioma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SeanWang0027/rlve-distill-scripts
- Checkpoint OPD (mencionado en el README): `SeanWang0027/opd-rlve-qwen3-1.7b-from-32b` (no verificado directamente, citado en la model card)
