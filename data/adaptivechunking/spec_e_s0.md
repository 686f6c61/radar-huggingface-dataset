# AdaptiveChunking/spec_E_s0

## Resumen

`spec_E_s0` es un modelo de investigación de 82.470.528 parámetros publicado por la organización AdaptiveChunking en Hugging Face bajo licencia Apache 2.0. Se trata de una ejecución concreta (un "run") de una arquitectura H-Net a nivel de byte, entrenada con el repositorio [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) mediante el entrenador heredado (`legacy/tier1/train.py`). El modelo fue separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el diseño por ejecución de Beetle.

Su relevancia no reside en capacidades de propósito general, sino en la experimentación con tokenización dinámica por chunks (dynamic chunking) sobre flujo de bytes, un área de investigación que busca eliminar la dependencia de tokenizadores BPE fijos. El repositorio incluye 21 checkpoints retenidos en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000...), lo que permite analizar la evolución del entrenamiento paso a paso.

No hay información publicada sobre idiomas soportados, pipeline de inferencia ni resultados de benchmarks. El modelo debe considerarse material de investigación y no un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (byte-level) con chunking dinámico |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `config.json` por checkpoint) |

## Arquitectura y entrenamiento

La arquitectura es una H-Net (Hierarchical Network) que opera directamente sobre bytes y aplica chunking dinámico, es decir, agrupa secuencias de bytes en unidades de longitud variable en lugar de usar un vocabulario de tokens predefinido. El entrenamiento se realizó con el entrenador heredado del repositorio beetle-hnet (`legacy/tier1/train.py`), que no conserva estado del optimizador; por ello el repositorio no incluye directorio `training_state/`.

El repositorio contiene 21 checkpoints retenidos distribuidos en ramas `step-N`, cada uno con `model.safetensors` y `config.json` que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights` (para restaurar pesos atados debe aplicarse `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre flujo crudo, sin tokenizador BPE externo.
- Chunking dinámico como mecanismo interno de segmentación de secuencias.
- Pesos atados (tied weights) entre componentes, restaurantes mediante el mapa `tied_weights`.
- Checkpoints intermedios para análisis de dinámica de entrenamiento.
- No se documentan capacidades de tool calling, agentes, visión, audio, modo thinking ni multilingüismo.
- No se documenta pipeline de inferencia (campo `pipeline` no disponible).

## Casos de uso

- Investigación en tokenización libre de vocabulario: el modelo permite comparar el chunking dinámico frente a tokenizadores BPE sobre el mismo corpus, usando los checkpoints `step-N` para medir la evolución de las fronteras de chunk.
- Análisis de dinámica de entrenamiento: los 21 checkpoints retenidos permiten trazar cómo evolucionan los pesos y las representaciones desde el paso 0 hasta los pasos altos sin necesidad de reentrenar.
- Evaluación de segmentación multilingüe: el dataset de sondas FLORES+ (`AdaptiveChunking/hnet-chunking-probes`, subcarpeta `spec_E_s0/`) está diseñado para medir fronteras de chunk sobre texto multilingüe, lo que convierte al modelo en banco de pruebas para comparar segmentación entre idiomas.
- Reproducción de experimentos: al estar los pesos en safetensors con `config.json` completo y mapa de pesos atados, un investigador puede restaurar el modelo exacto y reproducir resultados del run.
- Estudio de eficiencia en flujo de bytes: útil para analizar el coste computacional de operar sobre bytes frente a tokens en modelos de ~82M de parámetros.
- Base para ablaciones de arquitectura H-Net: sirve como punto de partida para comparar variantes de chunking (por ejemplo, otros runs `spec_*` de la misma organización) manteniendo constante el tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 330 MB solo para pesos (82,47M × 4 bytes), más activaciones y memoria del chunker dinámico.
- VRAM estimada en FP16/BF16: aproximadamente 165 MB para pesos; en cuantización de 8 bits, unos 82 MB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por tamaño; no se documentan requisitos específicos.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no documentadas. El repo usa PyTorch y safetensors; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al ser una arquitectura H-Net con chunking dinámico es probable que requiera código propio del repositorio beetle-hnet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AdaptiveChunking/spec_E_s0` | 82,47M | no disponible | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (repo de investigación) |
| `AdaptiveChunking/hnet-chunking-spec-82m` | ~82M (repo empaquetado) | no disponible | Misma familia, runs agrupados | Apache 2.0 | Hugging Face |
| Otros runs `spec_*` de AdaptiveChunking | no disponible | no disponible | Variantes del mismo experimento | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline de inferencia declarado; no es un artefacto listo para producción.
- Sin datos publicados de benchmarks, idiomas ni contexto: imposible evaluar calidad de forma objetiva.
- El entrenador heredado no guardó estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde un checkpoint.
- Los pesos atados requieren restaurar el mapa `tied_weights` (`sd[dst] = sd[src]`); una carga ingenua puede producir pesos incorrectos.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace desaconsejable su uso en producción sin validación propia.
- El chunking dinámico puede introducir comportamiento no determinista en la segmentación si no se fija la configuración del chunker.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_E_s0
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
