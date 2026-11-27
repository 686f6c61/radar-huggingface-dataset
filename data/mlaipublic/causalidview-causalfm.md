# mlaipublic/CausalIDView-CausalFM

## Resumen

CausalIDView-CausalFM es un repositorio de pesos publicado por el usuario `mlaipublic` que contiene copias sin modificar de los checkpoints upstream empleados por el proyecto CausalIDView, una herramienta de análisis de identificabilidad causal desarrollada en la Universidad Yonsei (repositorio `MLAI-Yonsei/CausalIDView`). No se trata de un modelo de lenguaje generativo, sino de un conjunto de tres ficheros `best_model.pth` (formato PyTorch) correspondientes a los checkpoints estándar, de datos financieros (FD) y de variables instrumentales binarias (IV_binary) del toolkit CausalFM.

El propósito del repositorio es servir de espejo reproducible: cada fichero está anclado a un commit concreto (`bb74ef7`) del repositorio `yccm/CausalFM-toolkit` y acompañado de su hash SHA-256, lo que permite verificar la integridad de los pesos y garantizar que las evaluaciones de CausalIDView se ejecutan sobre artefactos idénticos a los originales. El tamaño total del repositorio es de 0,1 GB, coherente con modelos de aprendizaje automático causal de pequeña escala y no con LLM.

La relevancia del artefacto es acotada pero específica: investigadores que replican experimentos de identificabilidad causal con CausalIDView pueden descargar los checkpoints desde Hugging Face sin depender de la disponibilidad del repositorio de GitHub original. La licencia declarada es Apache 2.0, aunque la model card remite a los términos upstream para el uso de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoints de CausalFM; no se especifica en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `best_model.pth`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con remision a los terminos upstream de CausalFM-toolkit) |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de los checkpoints. Se trata de tres artefactos independientes (`checkpoints_standard/best_model.pth`, `checkpoints_FD/best_model.pth` y `checkpoints_IV_binary/best_model.pth`) que corresponden a variantes de un modelo de aprendizaje causal del toolkit CausalFM: una configuración estándar, una orientada a datos financieros y otra a variables instrumentales binarias. No se proporciona información sobre el número de parámetros, la familia arquitectónica (MLP, transformer, modelo estructural) ni la composición del dataset de entrenamiento.

El repositorio no incluye proceso de entrenamiento propio: los pesos son copias literales de los publicados en el commit `bb74ef7` de `yccm/CausalFM-toolkit`, con hashes SHA-256 documentados para verificación (`9b75ebf0…` para standard, `16a8ae0c…` para FD y `bf0b2d87…` para IV_binary). No se documentan técnicas de RLHF, DPO ni innovaciones de decodificación, dado que el artefacto no es un modelo generativo.

## Capacidades

- Ejecución de inferencia causal en el marco de CausalIDView: los checkpoints alimentan el análisis de identificabilidad causal del proyecto MLAI-Yonsei.
- Tres variantes de dominio: estándar, datos financieros (FD) y variables instrumentales binarias (IV_binary).
- Verificación de integridad mediante SHA-256, lo que permite auditar que los pesos coinciden con los upstream.
- Reproducibilidad de experimentos: al estar anclados a un commit concreto, los resultados son comparables entre ejecuciones.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Replicación de experimentos de identificabilidad causal: descargar los tres checkpoints y ejecutar CausalIDView sobre ellos para reproducir los resultados publicados, evitando depender de la disponibilidad del repositorio GitHub original.
- Auditoría de integridad de pesos: comparar el SHA-256 de cada fichero descargado con el documentado en la model card para garantizar que no ha habido manipulación.
- Evaluación comparativa de métodos causales: usar las variantes standard, FD e IV_binary como líneas base frente a nuevos estimadores de efectos causales en datos financieros o con variables instrumentales.
- Docencia e investigación en causalidad: emplear los checkpoints como material didáctico en cursos de inferencia causal, dado su tamaño reducido (0,1 GB) y su licencia permisiva.
- Integración en pipelines de CI: verificar en integración continua que los pesos descargados coinciden con los hashes esperados antes de lanzar evaluaciones.
- Archivado a largo plazo: conservar una copia espejo de los pesos upstream en Hugging Face para preservar la reproducibilidad si el repositorio original cambia o desaparece.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,1 GB) sugiere que los tres checkpoints en conjunto ocupan menos de 100 MB, por lo que la inferencia cabría en cualquier GPU consumer.
- GPU recomendadas: no disponibles; por el tamaño, cualquier GPU con al menos unos pocos GB de VRAM (incluidas GTX 1650, RTX 3060 o superiores) sería suficiente, aunque no se confirma en la model card.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio, aunque no se documenta.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) dentro del pipeline de CausalIDView; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CausalIDView-CausalFM (este) | Checkpoints de modelo causal (CausalFM) | no disponible | no aplica | Apache 2.0 | Hugging Face + GitHub upstream |
| CausalFM-toolkit (upstream) | Toolkit de modelos causales | no disponible | no aplica | no disponible en la informacion | GitHub (`yccm/CausalFM-toolkit`) |
| CausalIDView (repo de codigo) | Herramienta de analisis de identificabilidad | no aplica | no aplica | no disponible en la informacion | GitHub (`MLAI-Yonsei/CausalIDView`) |

No se dispone de información sobre modelos comparables de terceros en la misma categoría (aprendizaje causal con checkpoints publicados) dentro de la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- La model card no documenta arquitectura, número de parámetros, datos de entrenamiento ni métricas, lo que limita cualquier evaluación técnica independiente.
- Los pesos son copias literales de un repositorio de GitHub; la licencia Apache 2.0 declarada puede no cubrir todos los términos upstream, que la propia model card remite a consultar.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de interpretaciones erróneas si se usa el modelo fuera del contexto de CausalIDView.
- Sesgos: no documentados; al tratarse de modelos entrenados para datos financieros (variante FD) o variables instrumentales, pueden heredar sesgos de los datasets originales, no especificados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se especifican limitaciones de contexto ni de idioma porque el artefacto no procesa lenguaje natural de forma documentada.
- Para producción, es imprescindible verificar los hashes SHA-256 y revisar los términos upstream antes de su uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/mlaipublic/CausalIDView-CausalFM
- Repositorio CausalIDView: https://github.com/MLAI-Yonsei/CausalIDView
- Repositorio upstream CausalFM-toolkit: https://github.com/yccm/CausalFM-toolkit
- Commit anclado de los checkpoints: https://github.com/yccm/CausalFM-toolkit/blob/bb74ef729c70d274fe2bb422c3b0edff4754fa37/checkpoints/checkpoints_standard/best_model.pth
