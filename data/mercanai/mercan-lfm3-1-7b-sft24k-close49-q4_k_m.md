# MercanAI/Mercan-LFM3-1.7B-SFT24K-Close49-Q4_K_M

## Resumen

Mercan-LFM3-1.7B-SFT24K-Close49-Q4_K_M es una derivación cuantizada del modelo LiquidAI/LFM3-1.7B, publicada por el usuario MercanAI. Se trata del artefacto Q4_K_M generado a partir del checkpoint FP16 del mismo autor (Mercan-LFM3-1.7B-SFT24K-Close49-F16), que a su vez parte del modelo base de Liquid AI tras un ajuste supervisado (SFT) sobre datos turcos y una etapa posterior de reparación de formato de razonamiento y terminación de 49 pasos. No es un reentrenamiento independiente: la cuantización solo altera la precisión de inferencia.

El modelo está orientado a generación de texto en turco y se distribuye en un formato propietario denominado MercanRuntime `.mercan`, con contenedor físico GGUF-v3. Esto implica que no es un GGUF estándar consumible por llama.cpp u Ollama sin adaptación, sino que requiere una compilación de MercanRuntime con soporte para la arquitectura LFM3 y para Q4_K_M. La relevancia de esta ficha es acotada: se trata de un artefacto de investigación experimental, sin descargas ni validación pública, que documenta el proceso de ajuste y cuantización de un modelo pequeño (1,7B) para un idioma específico.

La licencia del modelo base es la LFM Open License v1.0, que impone restricciones de uso comercial, obligaciones de redistribución y un umbral de facturación anual de 10 millones de dólares. El autor declara explícitamente que no se han completado evaluaciones en el leaderboard Cetvel para este artefacto cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (familia LiquidAI/LFM3-1.7B) |
| Parametros totales | 1,7B (según nombre del modelo base; no se detalla recuento exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (cuantización K mixta de 4 bits; algunos tensores en mayor precisión) |
| Idiomas soportados | turco (tr) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | `.mercan` (MercanRuntime) con contenedor físico GGUF-v3; no es safetensors de Transformers |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-1.7B, de la familia LFM3 de Liquid AI. La model card no detalla la arquitectura interna (tipo de transformer, mecanismos de atención, composición del corpus original ni número de tokens de preentrenamiento), por lo que esos datos deben consultarse en la documentación del modelo base. Lo que sí se documenta es el proceso de ajuste: un SFT sobre datos turcos (SFT24K) seguido de una etapa de 49 pasos de reparación sintética de formato de razonamiento y terminación, que empleó aproximadamente 413.865 tokens supervisados sintéticos en turco.

La cuantización se realizó con `llama-quantize` de llama.cpp, sin matriz de importancia (importance matrix), lo que puede afectar a la calidad relativa frente a cuantizaciones con calibración. El tokenizador GGUF original de LFM3 se preserva intacto. El artefacto pesa 1.247.083.552 bytes y se publica con hash SHA-256 verificable, además del hash del checkpoint FP16 de origen. El autor indica que se verificó carga, tokenización e inferencia en CPU con una compilación LFM3 de MercanRuntime, pero no se aportan métricas de calidad.

## Capacidades

- Generación de texto en turco, orientada a tareas de investigación y experimentación.
- Razonamiento en formato estructurado, reforzado mediante la etapa de reparación de 49 pasos (formato de razonamiento y terminación).
- Inferencia en CPU verificada por el autor con MercanRuntime (carga, tokenización y generación).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del formato de razonamiento entrenado.
- No se documenta capacidad multilingüe: el único idioma declarado es el turco.
- No se documenta visión, audio ni modo thinking explícito.

## Casos de uso

- Experimentación académica sobre ajuste fino y cuantización en turco: el artefacto permite reproducir el pipeline SFT24K + Close49 y comparar la salida FP16 frente a Q4_K_M en condiciones controladas.
- Evaluación de la degradación por cuantización: al publicarse tanto el checkpoint FP16 como el Q4_K_M, se puede medir la pérdida de calidad en tareas turcas concretas antes de decidir el formato de despliegue.
- Prototipado de asistentes en turco sobre hardware modesto: con 1,7B parámetros y cuantización de 4 bits, el modelo es candidato para pruebas en CPU o GPU de gama baja, siempre que se disponga de MercanRuntime con soporte LFM3.
- Investigación sobre reparación de formato de razonamiento: la etapa Close49 documentada permite estudiar cómo un ajuste sintético breve corrige problemas de terminación y estructura en la salida.
- Validación de toolchains de cuantización: sirve como caso de prueba para verificar que un runtime propietario (`.mercan`) carga correctamente contenedores GGUF-v3 con tokenizador LFM3.
- Base para futuros ajustes específicos de dominio en turco: al ser un derivado abierto (bajo LFM Open License), puede servir de punto de partida para SFT adicional, sujeto a las restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama resultados completados en el leaderboard Cetvel para este artefacto Q4_K_M y recomienda evaluar de forma independiente antes de desplegar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,7B parámetros en Q4_K_M y un peso de artefacto de ~1,2 GB, la inferencia requiere aproximadamente 1,5-2,5 GB de memoria (pesos más overhead de contexto y runtime); no se aporta una cifra oficial.
- GPU recomendadas: no disponible en la documentación; por tamaño, cabría en GPUs consumer con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060), aunque no está verificado por el autor.
- CPU: el autor verificó carga, tokenización e inferencia en CPU con MercanRuntime, por lo que el despliegue en CPU es viable.
- Opciones de despliegue: exclusivamente MercanRuntime con soporte LFM3 (https://github.com/Ahmet2001/MercanRuntime). No es compatible de forma directa con vLLM, llama.cpp, Ollama o TGI, ya que el formato `.mercan` no es un GGUF estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Mercan-LFM3-1.7B-SFT24K-Close49-Q4_K_M | 1,7B | no disponible | tr | LFM Open License v1.0 | `.mercan` (GGUF-v3) | Repo Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | no disponible en esta ficha | LFM Open License v1.0 | safetensors (Transformers) | Repo oficial de Liquid AI |
| Mercan-LFM3-1.7B-SFT24K-Close49-F16 (origen) | 1,7B | no disponible | tr | LFM Open License v1.0 | FP16 (formato del autor) | Repo Hugging Face del mismo autor |

La comparación con alternativas de otros fabricantes (por ejemplo, Qwen2.5-1.5B o Llama-3.2-1B) no se incluye porque no hay datos de rendimiento publicados para este artefacto que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización Q4_K_M puede reducir la precisión frente al checkpoint FP16; el autor no cuantifica esa pérdida.
- No hay benchmarks publicados ni validación independiente; las afirmaciones de calidad no están respaldadas por métricas.
- El modelo está entrenado y declarado únicamente para turco; su rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a modelos de 1,7B; no se documentan medidas de mitigación.
- El formato `.mercan` requiere un runtime propietario y una compilación específica con soporte LFM3; no es portable a toolchains estándar.
- La licencia LFM Open License v1.0 impone restricciones de uso comercial, obligaciones de aviso y un umbral de facturación anual de 10 millones de dólares; debe revisarse antes de cualquier despliegue productivo.
- Es un derivado experimental no oficial de Liquid AI; no cuenta con el respaldo del fabricante original.
- El repositorio no tiene descargas ni likes, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MercanAI/Mercan-LFM3-1.7B-SFT24K-Close49-Q4_K_M
- Checkpoint FP16 de origen: https://huggingface.co/MercanAI/Mercan-LFM3-1.7B-SFT24K-Close49-F16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Runtime requerido (MercanRuntime): https://github.com/Ahmet2001/MercanRuntime
- Licencia LFM Open License v1.0: incluida en el archivo LICENSE del repositorio
