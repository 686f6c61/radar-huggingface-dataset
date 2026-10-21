# nur-dev/unionmind-predictive-representations

## Resumen

`nur-dev/unionmind-predictive-representations` no es un modelo de lenguaje: es un paquete de artefactos de reproducción del artículo *Predictive Representations for Compact Bayesian Decision Making: Controlled Compression and Compositional Sensor Diagnosis*. Contiene 132 checkpoints de modelos de sensores (11 métodos × 2 presupuestos de etiquetas × 3 semillas × 2 conjuntos de datos), características procesadas, índices de partición, leyes de probabilidad generadas, puntuaciones de referencia, protocolos fijos y código ejecutable. Cada checkpoint se distribuye como un par de ficheros JSON y Safetensors, sin pickle ejecutable ni modelo preentrenado de lenguaje.

El problema que aborda es la diagnosis composicional de sensores bajo presupuestos de etiquetas muy reducidos y la compresión controlada de representaciones predictivas para toma de decisiones bayesiana. El repositorio está pensado para verificación y replicación: `reproduce.py --mode check` valida los 132 checkpoints y `analyze.py` recalcula la incertidumbre emparejada a partir de las puntuaciones de referencia. El tamaño total del repositorio es de 0,1 GB y la licencia combina MIT para el código y CC BY 4.0 para modelos, datos generados y resultados de investigación.

Es relevante ahora por su enfoque de transparencia radical: incluye resultados adversos (reversión hidráulica con 128 etiquetas, fallo de calibración, ausencia de superioridad en coste completo) y declara explícitamente que los artefactos no establecen fiabilidad operativa de diagnóstico de causa raíz. No se han encontrado enlaces externos ni publicaciones indexadas en la búsqueda web realizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos de diagnosis de sensores con representaciones predictivas y decisión bayesiana sobre datos tabulares; no es un transformer ni un LLM (arquitectura interna por método no disponible) |
| Parámetros totales | No disponible (132 checkpoints en un repositorio de 0,1 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica / no disponible: la entrada es tabular (características de sensores), no secuencias de tokens |
| Tipos de cuantización | No disponible; se distribuyen checkpoints Safetensors sin esquemas de cuantización documentados |
| Idiomas soportados | Inglés (en), únicamente en documentación y metadatos |
| Licencia | Código MIT; modelos originales, datos generados y resultados bajo CC BY 4.0; los registros de gas-drift (Vergara) no se redistribuyen y conservan su aviso legado de solo investigación |
| Formato de pesos | Safetensors con fichero JSON emparejado por checkpoint; sin pickle ejecutable |

## Arquitectura y entrenamiento

El repositorio agrupa 11 métodos de comparación de modelos de sensores evaluados bajo dos presupuestos de etiquetas y tres semillas sobre dos conjuntos de datos, lo que da los 132 checkpoints. Las características hidráulicas derivan de Helwig, Pignanelli y Schuetze (UCI DOI 10.24432/C5CW21) y las de sensores modulados por temperatura de Burgues (DOI 10.24432/C5S302); las grabaciones de gas-drift de Vergara (DOI 10.24432/C5RP6W) se descargan por separado y no se redistribuyen. El repositorio incluye implementaciones numéricas en el paquete `unionmind/`, protocolos fijos, definiciones de fuentes, fallos de elegibilidad y cómputo medido en `protocols/` y `provenance/`.

El entorno registrado es Python 3.11+, PyTorch 2.6.0 y CUDA 12.4 sobre una NVIDIA H200, con tiempos dependientes del hardware. El flujo de reproducción incluye verificación de checksums (`--mode check`), replay completo (`--mode all`), análisis de incertidumbre emparejada, generación de figuras y tablas del artículo, y tareas opcionales de reajuste independiente, reconstrucción de fuentes con verificación de digests, reproducción externa, reproducción controlada y análisis de sensibilidad. No se documentan en la información disponible detalles de composición del dataset de entrenamiento, número de tokens ni uso de RLHF/DPO.

## Capacidades

- Clasificación tabular de estados de sensores (pipeline declarado: `tabular-classification`).
- Inferencia bayesiana sobre representaciones predictivas para decisión compacta.
- Generalización composicional: diagnosis con subconjuntos y composiciones de sensores.
- Cuantificación de incertidumbre emparejada por semilla y presupuesto de etiquetas.
- Reproducción determinista de 132 checkpoints con verificación de integridad SHA-256.
- Reajuste independiente y reconstrucción de fuentes originales con comprobación de digests.
- Análisis de sensibilidad y recálculo de frentes de compromiso controlados.
- Generación de leyes de probabilidad y muestras sintéticas asociadas a los modelos.
- No soporta generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües.

## Casos de uso

- Replicación de resultados de investigación: ejecutar `reproduce.py --mode check` para validar los 132 checkpoints y `--mode all` para reproducir la comparación primaria controlada y el resultado de sign-flip a cuatro días, con informes JSON verificables.
- Auditoría de métodos de clasificación tabular bayesiana: comparar los 11 métodos bajo dos presupuestos de etiquetas y tres semillas usando las puntuaciones de referencia incluidas, sin necesidad de reentrenar.
- Investigación en diagnosis de fallos de sensores: emplear las características hidráulicas y las de sensores modulados por temperatura para estudiar generalización composicional con muy pocas etiquetas (incluido el escenario de 128 etiquetas).
- Estudio de calibración y coste de decisión: analizar los fallos de calibración y la ausencia de superioridad en coste completo documentados, como material docente sobre evaluación honesta de clasificadores.
- Verificación de integridad de artefactos científicos: usar `SHA256SUMS.json` y los protocolos fijos para pipelines de comprobación reproducible en publicaciones o revisiones por pares.
- Análisis de sensibilidad metodológica: ejecutar `paper/sensitivity_analysis.py` para medir la robustez de las conclusiones frente a decisiones de protocolo.
- Reconstrucción de fuentes: `rebuild_sources.py` descarga archivos oficiales y verifica sus digests, útil para laboratorios que necesitan reconstruir el corpus desde cero respetando las licencias de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje. Los únicos resultados numéricos declarados en la model card son:

| Resultado declarado | Valor |
|---|---|
| Ganancia de utilidad por compresión controlada | 0,1013 |
| Criterio externo de mejora por compresión | Falla |
| Comparación temporal a cuatro días | Secundaria; un día de origen falla la comprobación de reloj |
| p unilateral exacto a nivel de día | 0,0625 |
| Reversión hidráulica con 128 etiquetas | Retenida como resultado adverso |
| Calibración | Fallo documentado |
| Superioridad en coste completo | No demostrada |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,1 GB, por lo que los 132 checkpoints son agregadamente muy ligeros y caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: el entorno registrado usa una NVIDIA H200 con CUDA 12.4; para replay de checkpoints no se requiere esa clase de GPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con soporte CUDA (los scripts usan `--device cuda:0`); no se documenta soporte CPU explícito, aunque PyTorch lo permitiría.
- Opciones de despliegue: ejecución directa con Python 3.11+ y PyTorch; no hay integración con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo generativo.
- Latencia y throughput: no disponibles; la model card indica únicamente que los tiempos dependen del hardware.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (artefactos de reproducción para decisión bayesiana con diagnosis composicional de sensores), ni datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, visión ni audio.
- Los propios autores declaran que estos artefactos no establecen fiabilidad operativa de diagnóstico de causa raíz.
- El criterio externo de mejora por compresión falla; la mejora solo se sostiene en el entorno controlado (0,1013 de utilidad).
- La comparación temporal a cuatro días es secundaria porque un día de origen no supera la comprobación de reloj, con p unilateral de 0,0625.
- Se documentan fallos de calibración y ausencia de superioridad en coste completo; la reversión hidráulica con 128 etiquetas se retiene como resultado adverso.
- Idioma único: inglés; documentación y metadatos no están traducidos.
- Licencia mixta: el código es MIT, pero modelos, datos generados y resultados son CC BY 4.0; los datos de gas-drift no se redistribuyen y mantienen un aviso legado de solo investigación, lo que puede impedir uso comercial de derivados basados en esa fuente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente conocida.
- Fechas de creación y actualización registradas en 2026-10-21, con apenas 18 segundos entre ambas; el contenido debe tratarse como material de investigación no auditado externamente.

## Enlaces

- HuggingFace: https://huggingface.co/nur-dev/unionmind-predictive-representations
- Licencia del repositorio: https://huggingface.co/nur-dev/unionmind-predictive-representations/blob/main/LICENSE.md
- Características hidráulicas (Helwig, Pignanelli y Schuetze, UCI): https://doi.org/10.24432/C5CW21
- Sensores modulados por temperatura (Burgues, UCI): https://doi.org/10.24432/C5S302
- Gas-drift (Vergara, UCI): https://doi.org/10.24432/C5RP6W
- Artículo de referencia: *Predictive Representations for Compact Bayesian Decision Making: Controlled Compression and Compositional Sensor Diagnosis* (sin enlace disponible en la información proporcionada)
- La búsqueda web realizada no devolvió enlaces relevantes al modelo, al artículo ni a repositorios de código asociados.
