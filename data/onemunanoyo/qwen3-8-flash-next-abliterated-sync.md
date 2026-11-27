# onemunanoyo/Qwen3.8-Flash-Next-Abliterated-Sync

## Resumen

Qwen3.8-Flash-Next-Abliterated-Sync es una edición derivada del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario onemunanoyo. No se trata de un modelo entrenado desde cero, sino de una transferencia de dirección de rechazo (refusal direction) extraída del modelo abliterado de Huihui AI sobre los pesos cuantizados del formato Sync-Strata de hiru2005. La operación modifica únicamente 72 tensores densos de las capas 6 a 41 del GGUF compartido, dejando intactos los 24.576 expertos MoE enrutados, el tokenizador, las tablas PLE y el módulo mtp-rt.

El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de aproximadamente 56.148 millones de parámetros totales, según los datos de safetensors del repositorio. La release se distribuye como GGUF cuantizado en formato Sync-Strata, con un tamaño de repositorio de 33,1 GB y un GGUF común de 30,45 GiB. Está pensado para ejecutarse con el motor Sync-Strata (o Strata desde CLI), no con llama.cpp ni Ollama convencionales.

Su relevancia es acotada y muy específica: sirve a usuarios del ecosistema Sync-Strata que quieren un modelo con la capa de rechazo atenuada sin perder la fidelidad de la cuantización original ni la integridad de los expertos enrutados. La licencia declarada es qwen-community-1.0, heredada del modelo base, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivada de Qwen3.8-Flash-Next |
| Parametros totales | 56.147.944.320 (56,15 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado en formato Sync-Strata (fixed-scale); escala exacta no especificada |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | GGUF (Sync-Strata common GGUF) más parche binario y safetensors del modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE heredado de Qwen3.8-Flash-Next, con 24.576 expertos enrutados según la model card. El modelo no ha sido reentrenado: la contribución de esta release es puramente de edición de pesos. Se extrajo un vector unitario de dirección de rechazo `r ∈ ℝ²⁵⁶⁰` (en float64) del modelo `huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated` y se transfirió sobre los pesos cuantizados de `hiru2005/Sync-shared` mediante un solver de alineación de Gram.

La innovación técnica es la preservación de la cuantización: el parche afecta solo a 72 tensores residuales densos de las capas 6 a 41 (unos 431 MiB de los 30,45 GiB del GGUF común), sin tocar ninguna escala de cuantización ni ningún experto enrutado. El repositorio incluye un manifiesto con hashes SHA-256 por tensor, un script de aplicación y auditoría en Python estándar, un informe del solver con métricas de deriva ortogonal y un resumen de evaluación. La cuantización de origen usa rotación Hadamard de tipo Gyro-S, atribuida a Agention, y el motor de inferencia upstream es Strata (Niko1221/Strata). No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.8-Flash-Next.
- Razonamiento y matemáticas: capacidades del modelo base, sin datos específicos publicados en esta release.
- Generación de código: presumiblemente soportada por el modelo base, sin evaluación propia en la información disponible.
- Comportamiento abliterado: la dirección de rechazo transferida atenúa las respuestas de negativa del modelo original.
- Integración con el ecosistema Sync-Strata: funciona con los packs Sync-XS, Sync-S y Sync-M y con Sync-Strata Desktop.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso vía API, sin detalles adicionales.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteration: permite estudiar cómo se comporta una dirección de rechazo transferida sobre pesos cuantizados sin alterar escalas, gracias al informe del solver y al vector `refusal_dir.npy` incluido.
- Auditoría de parches de pesos: el manifiesto con hashes por tensor, `apply_patch.py --verify` y `SHA256SUMS.txt` permiten verificar la integridad byte a byte de una modificación, útil en pipelines de validación de modelos.
- Despliegue local con Sync-Strata: usuarios que ya ejecutan Sync-XS, Sync-S o Sync-M pueden sustituir el GGUF común de 30,45 GiB por esta versión sin cambiar flags ni configuración.
- Experimentación con modelos sin filtros de rechazo: para pruebas de robustez, red teaming controlado o evaluación de sesgos en entornos de investigación aislados.
- Comparación de fidelidad de cuantización: al preservar los 24.576 expertos y las escalas, sirve para medir el impacto aislado de la edición de las capas densas 6 a 41.
- Reproducibilidad de releases derivadas: el flujo de parche de 431 MiB sobre `Sync-shared` (SHA-256 `82a78508...`) documenta un método replicable para otras ediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. El repositorio incluye un `audit/eval_summary.json` con cifras agregadas para Sync-XS y Sync-S, pero su contenido numérico no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada: el GGUF común ocupa 30,45 GiB; se necesita al menos esa cantidad de memoria (GPU o mixta CPU/GPU) para cargarlo, más overhead del motor Sync-Strata y de los packs de expertos.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabe en A100 80 GB o H100, y previsiblemente en configuraciones multi-GPU consumer.
- GPU consumer: no cabe en una RTX 4090 (24 GB) en una sola unidad con el GGUF completo; requeriría offload a CPU o reparto entre varias GPU.
- Despliegue: motor Sync-Strata (GUI, `sync up`, `sync chat`, API) o Strata desde CLI con `--native` y `--ple-gguf` apuntando a la misma ruta. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Abliterated-Sync | 56,15 mil M | no disponible | GGUF Sync-Strata | qwen-community-1.0 | Edición de 72 tensores densos; expertos intactos |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | no disponible | no disponible | BF16 | no disponible | Fuente del vector de rechazo; abliteration completa |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | safetensors | qwen-community-1.0 | Modelo base original sin modificar |
| hiru2005/Sync-shared | no disponible | no disponible | GGUF Sync-Strata | no disponible | Pesos compartidos cuantizados sin abliteration |

## Limitaciones y advertencias

- La abliteration elimina o atenúa la capa de rechazo, lo que puede producir respuestas dañinas, sesgadas o inapropiadas; no es apto para producción orientada al público sin filtros adicionales.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta release.
- La licencia qwen-community-1.0 impone condiciones al uso comercial; conviene revisar el archivo LICENSE antes de desplegar.
- Solo funciona con el ecosistema Sync-Strata/Strata; no es un GGUF estándar para llama.cpp u Ollama.
- No se debe ejecutar la reparación SHA-256 de Sync-Strata sobre `native-gguf`, ya que sobrescribiría el parche con el digest upstream.
- Al invocar `strata` desde CLI, `--native` y `--ple-gguf` deben apuntar a la misma ruta para evitar el registro duplicado de tensores densos.
- Idiomas soportados y longitud de contexto no documentados en esta release.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- [Hugging Face: onemunanoyo/Qwen3.8-Flash-Next-Abliterated-Sync](https://huggingface.co/onemunanoyo/Qwen3.8-Flash-Next-Abliterated-Sync)
- [Modelo base: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Fuente del vector de rechazo: huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated)
- [Pesos compartidos: hiru2005/Sync-shared](https://huggingface.co/hiru2005/Sync-shared)
- [Pack Sync-XS](https://huggingface.co/hiru2005/Sync-XS)
- [Pack Sync-S](https://huggingface.co/hiru2005/Sync-S)
- [Pack Sync-M](https://huggingface.co/sync-strata/Sync-M)
- [Repositorio Sync-Strata en GitHub](https://github.com/hiruhiru2005/sync-strata)
- [Motor Sync-Strata en GitHub](https://github.com/hiruhiru2005/sync-strata-engine)
- [Motor de inferencia Strata](https://github.com/Niko1221/Strata)
