# shenmaa/fec26-sii-fusion-weights

## Resumen

`shenmaa/fec26-sii-fusion-weights` no es un modelo de lenguaje, sino un conjunto de pesos entrenados para el reto de reconstrucción de equilibrio en reactores de fusión tokamak (SII Fusion Equilibrium Challenge). El repositorio publica dos artefactos independientes: una red neuronal de unos 1,0 GB entrenada sobre datos del tokamak MAST-U (`mast_v3/best.pt`) y un perceptrón multicapa mucho más pequeño de unos 20 MB entrenado sobre datos de DIII-D (`diiid/model.pt`). El autor es el usuario de Hugging Face `shenmaa` y los pesos corresponden a la submission 1012261 del citado reto.

La relevancia del artefacto es acotada y muy específica: se trata de material reproducible para un benchmark científico de física de plasmas, no de un modelo de propósito general. El repositorio incluye además ficheros de soporte (`layout.json`, `stats.json`) que contienen la disposición de canales y las estadísticas de normalización usadas durante el entrenamiento, imprescindibles para ejecutar la inferencia con el código original.

Conviene subrayar que la model card no describe arquitectura, hiperparámetros, composición del dataset ni resultados de validación más allá del número de paso del checkpoint. Toda la información técnica disponible se limita al tamaño de los ficheros, sus checksums, el hardware y el tiempo de entrenamiento, y la referencia al repositorio de código `SII-AI4Fusion/fusion-equilibrium-challenge`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal para reconstrucción de equilibrio; el fichero `diiid/model.pt` contiene un MLP y dos regresiones ridge) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entradas son datos de diagnóstico de tokamak) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), más ficheros JSON auxiliares (`layout.json`, `stats.json`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red principal. Sabemos que `mast_v3/best.pt` contiene los pesos de la red y la configuración de entrenamiento, y que la inferencia requiere leer `layout.json` (disposición de canales) y `stats.json` (estadísticas de normalización) desde el mismo directorio mediante `--cache-dir`. Por el contrario, `diiid/model.pt` sí se describe explícitamente como un MLP con estandarización de entrada y dos regresiones ridge asociadas.

En cuanto al entrenamiento, `mast_v3/best.pt` se produjo con 8 GPU H100 durante 1,71 horas, y el checkpoint publicado corresponde al paso 37 000 de 40 000 (el de menor pérdida de validación). El modelo de DIII-D se entrenó con 1 GPU H100 durante 50 épocas. Los pesos se generaron con el código de investigación original (commit `cdeb6df` de crossmak y el script del starter kit), y el autor indica que la ruta de entrenamiento es exactamente la que ejecutan `scripts/train_mast.sh` (`NPROC=8`) y `scripts/train_diiid.sh`, con verificación documentada en `docs/verification.md`. No se especifican número de tokens, composición del dataset, ni uso de RLHF/DPO (técnicas que, por otra parte, no aplican a este dominio).

## Capacidades

- Reconstrucción de equilibrio de plasma en tokamak a partir de datos de diagnóstico, en el marco del reto SII Fusion Equilibrium Challenge.
- Inferencia sobre datos de MAST-U mediante la red principal (`mast_v3/best.pt`) junto con los ficheros de layout y normalización.
- Inferencia sobre datos de DIII-D mediante el MLP y las regresiones ridge incluidas en `diiid/model.pt`.
- Reproducibilidad verificable: los checksums SHA-256 de todos los ficheros permiten validar la integridad de los pesos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio en el sentido habitual de los LLM; su entrada son señales de diagnóstico de un dispositivo experimental.

## Casos de uso

- Reproducción de la submission 1012261: descargar los pesos, verificar los checksums SHA-256 indicados en la model card y ejecutar la inferencia con el código del repositorio `SII-AI4Fusion/fusion-equilibrium-challenge` para replicar los resultados del reto.
- Investigación en reconstrucción de equilibrio: usar `mast_v3/best.pt` como punto de partida o baseline para comparar nuevas arquitecturas sobre datos de MAST-U, gracias a que el checkpoint publicado es el de menor pérdida de validación.
- Experimentación con DIII-D a bajo coste: el modelo `diiid/model.pt` (unos 20 MB) permite iterar rápidamente en una sola GPU, incluso consumer, con un pipeline MLP más regresiones ridge.
- Validación de pipelines de normalización: los ficheros `layout.json` y `stats.json` sirven para comprobar que la disposición de canales y las estadísticas de normalización del usuario coinciden con las del entrenamiento original.
- Docencia y divulgación en fusión: el tamaño manejable del modelo de DIII-D y la licencia MIT facilitan su uso en cursos o talleres sobre aprendizaje aplicado a física de plasmas.
- Auditoría de resultados científicos: al estar publicados los checksums y la revisión exacta (`ea109c04b12ca643a5c3d8469054f8ede44fbf55`), un tercero puede verificar que los pesos evaluados son los declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que el checkpoint de MAST-U corresponde al paso 37 000 de 40 000 por ser el de menor pérdida de validación, pero no se proporciona el valor de dicha pérdida ni métricas del reto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, `mast_v3/best.pt` ocupa 1 027 007 886 bytes (~1,0 GB) en disco y `diiid/model.pt` 19 992 372 bytes (~20 MB); el consumo en memoria será algo superior al tamaño del fichero más los buffers de inferencia.
- GPU recomendadas: el autor entrenó con 8 × H100 (MAST-U) y 1 × H100 (DIII-D), pero no se especifican requisitos mínimos de inferencia.
- GPU consumer: el modelo de DIII-D (~20 MB) debería caber con holgura en cualquier GPU consumer moderna; para el modelo de MAST-U (~1 GB) es plausible que también quepa en tarjetas con 8 GB o más, aunque no hay confirmación en la información disponible.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican). El despliegue se realiza con el código de investigación del repositorio `SII-AI4Fusion/fusion-equilibrium-challenge`, usando PyTorch y los scripts `scripts/train_mast.sh` / `scripts/train_diiid.sh` como referencia de la ruta de ejecución.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de reconstrucción de equilibrio en tokamak con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no admite instrucciones en lenguaje natural. Cualquier uso fuera del dominio de reconstrucción de equilibrio en tokamak carece de sentido.
- Sesgos conocidos: no documentados. Al entrenarse con datos de dos dispositivos concretos (MAST-U y DIII-D), es esperable un sesgo hacia sus características de diagnóstico, pero el autor no lo detalla.
- Riesgo de alucinación: no aplica en el sentido de los LLM; sí existe riesgo de predicciones de equilibrio incorrectas fuera de la distribución de entrenamiento, sin que se hayan publicado métricas de error.
- Limitaciones de contexto o idioma: no aplica; las limitaciones reales dependen de la cobertura de canales de diagnóstico recogida en `layout.json`.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; conviene revisar igualmente la licencia del código del repositorio asociado, que puede ser distinta.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, y el autor no aporta métricas de validación ni instrucciones de inferencia independientes; la model card remite al código externo. Los pesos deben colocarse exactamente en `weights/mast_v3/` y `weights/diiid/` y verificarse con los SHA-256 indicados antes de usarlos. La fecha de creación del repositorio (2026-10-31) es posterior a la fecha actual, lo que conviene tener en cuenta al evaluar su vigencia.

## Enlaces

- Repositorio de pesos en Hugging Face: https://huggingface.co/shenmaa/fec26-sii-fusion-weights
- Revisión concreta citada: `ea109c04b12ca643a5c3d8469054f8ede44fbf55`
- Código del reto: https://github.com/SII-AI4Fusion/fusion-equilibrium-challenge
- Documentación de verificación: `docs/verification.md` dentro del repositorio de código
- Scripts de entrenamiento de referencia: `scripts/train_mast.sh`, `scripts/train_diiid.sh`
