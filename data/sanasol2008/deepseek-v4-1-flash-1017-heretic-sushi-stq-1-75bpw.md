# sanasol2008/DeepSeek-V4.1-Flash-1017-Heretic-Sushi-STQ-1.75bpw

## Resumen

DeepSeek-V4.1-Flash-1017 Heretic Sushi STQ 1.75bpw es una preservación completa y autónoma (full-root) de un checkpoint DeepSeek-V4.1-Flash cuantizado a 1,75 bits por peso mediante el formato STQ (Sushi Trellis Quantization), publicado por el usuario sanasol2008. No es un modelo entrenado desde cero ni un fine-tune: es un artefacto de cuantización que combina el pack oficial STQ de beamster con 38 matrices de proyección de salida de atención (`attn.wo_b`, capas 2 a 39) recodificadas a partir del parche FP8 nativo "Heretic" de pqhaz. El resto de tensores —expertos enrutados, tablas Engram, pesos MTP, tokenizer y configuración— permanecen intactos respecto al STQ oficial.

El modelo declara 261.320.630.994 parámetros totales según los safetensors y un repositorio de 332,1 GB (309,3 GiB), lo que lo sitúa en la categoría de modelos frontera con arquitectura presumiblemente Mixture-of-Experts (la presencia de "expertos enrutados" y pesos MTP así lo sugiere). La relevancia actual es doble: por un lado, demuestra que es viable distribuir un modelo de este tamaño en un único root autónomo ejecutable en Apple Silicon con 48 GB de memoria unificada; por otro, ilustra las técnicas de cuantización extrema (1,75 bpw) y de ablación selectiva de capas de atención que la comunidad está explorando para reducir requisitos de hardware.

Conviene subrayar que la propia model card advierte de que solo se ha validado un "runtime smoke" (carga y generación breve) y que la calidad general, la ablación efectiva y la KLD del modelo completo no están verificadas. Es, por tanto, un artefacto experimental orientado a investigación y pruebas de infraestructura, no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer con expertos enrutados y pesos MTP, inferido de la model card) |
| Parametros totales | 261.320.630.994 |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 tokens (contexto probado en el smoke test; máximo no disponible) |
| Tipos de cuantizacion | STQ 1,75 bpw (trellis); parche FP8 nativo en las 38 capas attn.wo_b |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (root completo, no GGUF) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, del que no se proporcionan detalles arquitectónicos en la información disponible (número de capas, dimensión oculta, configuración MoE, composición del dataset de entrenamiento ni si hubo RLHF/DPO). La model card menciona explícitamente "expertos enrutados" (routed experts), "tablas Engram" y "pesos MTP" (Multi-Token Prediction), lo que apunta a una arquitectura Mixture-of-Experts con componentes auxiliares de predicción multi-token y módulos Engram, pero no se confirman cifras de parámetros activos ni topología.

La innovación técnica de este artefacto es la cuantización: el pack STQ oficial de beamster aplica Trellis Quantization a 1,75 bits por peso, y sobre él se sustituyen 38 matrices `attn.wo_b` (capas 2 a 39) recodificadas desde FP8 mediante mínimos cuadrados sin calibrar en float32 (receta SPEC1, distinta de la "Sashimi" privada). Los bancos trellis de esas 38 matrices son lo único alterado; escalas y cabeceras de tensor originales se conservan. No hay reentrenamiento ni RLHF adicional en este paso: es puramente un proceso de recuantización y preservación.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Razonamiento y código: capacidades heredadas del modelo base DeepSeek-V4.1-Flash, no verificadas en este artefacto.
- Soporte de pesos MTP (Multi-Token Prediction) incluidos en el root, aunque deshabilitados en el smoke test.
- Tablas Engram incluidas (mecanismo de memoria/contexto del modelo base, función exacta no disponible).
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en Hugging Face).
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible; el smoke test ejecutó con visión deshabilitada.
- Ablación "Heretic" parcial: solo se han recodificado 38 capas de atención, no se ha realizado una ablación completa del checkpoint.

## Casos de uso

- Investigación en cuantización extrema: el artefacto permite estudiar el impacto de 1,75 bpw y de la recuantización selectiva de capas de atención sobre la calidad, comparando contra el STQ oficial de beamster y el FP8 de pqhaz.
- Pruebas de infraestructura en Apple Silicon: sirve para validar el motor Sushi 1.6.0 y presupuestos de peso en SSD (28 GiB) en máquinas con 48 GB de memoria unificada, midiendo latencia real de 1-2 tokens/s en un M3.
- Reproducibilidad de pipelines de cuantización: los scripts y la evidencia numérica en `provenance/` permiten reproducir la recodificación SPEC1 de las 38 matrices `attn.wo_b` y auditar el manifiesto `preservation-verification.json`.
- Benchmarking de motores de inferencia: al ser un root completo sin overlay, se puede usar como caso de prueba para validar cargadores que soporten STQ trellis y safetensors de gran tamaño.
- Estudio de seguridad y alineación: los "short refusal probes" mencionados permiten explorar de forma preliminar el efecto de la ablación parcial sobre comportamientos de rechazo, siempre con la cautela de que no constituyen una evaluación de seguridad.
- Despliegue experimental en local para prototipos de generación de texto de baja latencia esperada, aceptando el throughput reducido (1-2 tokens/s) y el contexto limitado a 2048 tokens en la configuración probada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la KLD del modelo completo no se ha evaluado y que la calidad general permanece sin verificar. El único dato de rendimiento es empírico: aproximadamente 1-2 tokens/s en un Apple M3 con 48 GB de memoria unificada, presupuesto SSD de 28 GiB para pesos y contexto de 2048 tokens, en pruebas en frío con caché pequeña.

## Requisitos de hardware

- VRAM/memoria: el root completo ocupa 332,1 GB (309,3 GiB) en disco; requiere al menos 8 GiB adicionales de espacio libre durante la descarga. El presupuesto de pesos en SSD probado es de 28 GiB, que no equivale a la memoria total del proceso.
- Memoria unificada: el smoke test se ejecutó en un Apple Silicon con 48 GB de memoria unificada (clase M3).
- GPU dedicadas: no disponible; no se han probado A100, H100 ni RTX 4090 en la información proporcionada.
- Consumer GPU: no confirmado. El tamaño del root (309,3 GiB) excede la VRAM de cualquier GPU de consumo actual; el diseño está orientado a streaming desde SSD con el motor Sushi.
- Despliegue: motor Sushi 1.6.0 para macOS Apple Silicon (binario `sushi-bin-macos-arm64`), modo `serve` en `127.0.0.1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato STQ trellis no es GGUF.
- Throughput: 1-2 tokens/s en el M3 de prueba, con caché pequeña y en frío; no son medidas de rendimiento máximo.
- Ajustes recomendados: no elevar a ciegas los límites de memoria wired de macOS; mantener MTP y visión deshabilitados en la configuración probada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 Heretic Sushi STQ 1.75bpw (este) | 261,3 B | 2048 (probado) | STQ 1,75 bpw + FP8 en 38 capas attn.wo_b | MIT | Hugging Face, root completo 332,1 GB |
| beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw | no disponible | no disponible | STQ 1,75 bpw oficial | no disponible | Hugging Face |
| pqhaz/DeepSeek-V4.1-Flash-1017-heretic | no disponible | no disponible | FP8 nativo | no disponible | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | original (probablemente BF16/FP8) | no disponible | no disponible en la búsqueda |

La comparativa se limita a los artefactos citados en la model card; no se dispone de datos de benchmarks ni de parámetros activos de las alternativas para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Calidad no verificada: solo se ha realizado un runtime smoke; no hay evaluación de KLD del modelo completo ni de calidad general.
- Ablación incompleta: la sustitución "Heretic" afecta únicamente a 38 matrices `attn.wo_b`; no es una recuantización completa del checkpoint Heretic ni una ablación de seguridad validada.
- Riesgo de alucinación y sesgos: no evaluados en este artefacto; se heredan los del modelo base, que no se documentan.
- Contexto limitado en la prueba: 2048 tokens; el máximo real del modelo base no se especifica.
- Idiomas: no declarados; no se puede garantizar soporte multilingüe.
- Licencia MIT: permite uso comercial, pero el artefacto es experimental y no apto para producción sin validación adicional.
- Throughput muy bajo en el hardware probado (1-2 tokens/s), lo que descarta aplicaciones interactivas en ese entorno.
- Requisitos de disco elevados (332,1 GB) y dependencia del motor Sushi 1.6.0, sin soporte documentado en otros runtimes.
- El downloader de ejemplo reinicia desde cero los archivos grandes fallidos; conviene planificar la descarga con margen de red y disco.
- Advertencia del autor: los "short refusal probes" no constituyen prueba de ablación exitosa ni evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanasol2008/DeepSeek-V4.1-Flash-1017-Heretic-Sushi-STQ-1.75bpw
- Modelo base STQ: https://huggingface.co/beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw
- Parche Heretic FP8: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Motor Sushi (release v1.6.0): https://github.com/beamivalice/sushi/releases/download/v1.6.0
- Repositorio Sushi: https://github.com/beamivalice/sushi
