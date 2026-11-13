# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed1

## Resumen

El modelo `mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed1` es un separador de fuentes de audio (source separation) desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un fine-tune del modelo base `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1`, entrenado con la técnica MixIT sobre mezclas reverberantes observadas del dataset FUSS, sin disponer de fuentes aisladas como objetivos de entrenamiento. El modelo opera en modo offline y no causal, a una frecuencia de muestreo de 8 kHz, y produce 8 ranuras de salida (slots) no ordenadas que no corresponden a clases semánticas.

Arquitectura y escala: emplea un backbone compacto TF-Locoformer con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones, con un total de 1.293.568 parámetros. El contexto de entrenamiento es de 6 segundos (10 segundos en la evaluación final), con STFT de FFT 256 y hop 128. El modelo está pensado para escenarios de separación de mezclas de mezclas con hasta 8 fuentes combinadas a partir de escenas que contienen entre 1 y 4 fuentes cada una.

La relevancia de esta ficha es doble: por un lado, ilustra una receta de entrenamiento MixIT en dos etapas con fine-tuning disperso (coeficiente de sparsity 16) y selección de checkpoints guiada por SI-SDRi de fuentes en desarrollo; por otro, su licencia restrictiva (`public-access-no-weight-license-grant`) limita explícitamente el uso de los pesos, lo que condiciona cualquier despliegue en producción. No se han publicado evaluaciones en test independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path), 3 bloques dual-path |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 6 s de audio de entrenamiento (10 s en evaluación final); mono a 8.000 Hz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (licencia de pesos restrictiva) |
| Formato de pesos | safetensors (BF16 backbone; STFT, síntesis y objetivo en FP32) |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 8 ranuras de salida y 3 bloques dual-path. La configuración concreta es de 64 canales, 4 cabezas de atención, FFN de 128 dimensiones, kernel de convolución 4 y 4 grupos de normalización RMS. La representación se obtiene con STFT de FFT 256, hop 128 y ventana Hann con padding constante centrado. El wrapper normaliza por RMS cada mezcla internamente, restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual igualitaria, distribuyendo `mixture - sum(outputs)` entre las salidas.

El entrenamiento sigue una receta en dos etapas. Primero se entrena el modelo padre `plain-seed1` durante 60.000 actualizaciones, seleccionando el checkpoint de validación MixIT en la actualización 56.000. Después se cargan esos pesos, se reinician el optimizador AdamW y el sampler, y se ejecutan 8.000 actualizaciones de fine-tuning disperso con coeficiente de sparsity 16 (frente a 0 en el padre). Los datos son FUSS reverberantes en la revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`, con 20.000 escenas de entrenamiento y 1.000 de desarrollo; cada actualización usa 16 pares de escenas con crops uniformes independientes de 6 segundos a 8.000 Hz mono (48.000 muestras). El optimizador es AdamW con betas (0.9, 0.999), epsilon 1e-8, weight decay 0.01, learning rate constante de 0.0001 en el fine-tune y clipping de norma global 5. Se usó BF16 en el backbone, FP32 en STFT/síntesis/asignación/objetivo, TF32 permitido, algoritmos deterministas de Torch y `CUBLAS_WORKSPACE_CONFIG=:4096:8`. El entrenamiento se ejecutó en una NVIDIA A100 de 80 GB con PyTorch 2.7.1 y CUDA 12.6.

## Capacidades

- Separación de fuentes de audio en modo offline y no causal, con 8 ranuras de salida no ordenadas (no son clases semánticas).
- Procesamiento de mezclas de mezclas: cada escena observada contiene entre 1 y 4 fuentes y la mezcla combinada puede contener hasta 8.
- Reconstrucción de mezclas observadas mediante MixIT, sin necesidad de fuentes aisladas como supervisión.
- Consistencia de mezcla residual: las salidas suman la mezcla de entrada tras la síntesis.
- Operación a 8 kHz mono, orientada a voz y audio de banda estrecha.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de audio.
- No dispone de capacidades multilingües de texto, visión ni audio de entrada en otros formatos.
- No se documenta modo thinking ni ninguna capacidad generativa de texto.

## Casos de uso

- Separación de hablantes en grabaciones de reuniones: el modelo puede descomponer una mezcla reverberante de varias voces en hasta 8 pistas, útil para transcripción diarizada posterior, aunque limitado a 8 kHz y a audio de banda estrecha.
- Preprocesado para pipelines de reconocimiento automático del habla: al separar fuentes antes de un ASR, se reduce la interferencia entre hablantes; el modelo es adecuado porque trabaja directamente sobre mezclas observadas sin requerir fuentes de referencia.
- Limpieza de archivos de audio históricos o de baja calidad: su entrenamiento sobre FUSS reverberante lo hace apto para escenas con reverberación, un caso habitual en grabaciones de campo.
- Investigación en separación no supervisada: sirve como referencia reproducible de la receta MixIT en dos etapas con fine-tuning disperso, gracias a los checkpoints intermedios publicados (pasos 2000, 3000, 6000, 7000 y 8000).
- Generación de datos sintéticos para entrenar otros modelos: las salidas separadas pueden usarse como pseudo-etiquetas en pipelines de aumento de datos, siempre que la licencia lo permita.
- Evaluación comparativa de arquitecturas ligeras: con 1,29 M de parámetros, es un candidato para benchmarks de separación en entornos con recursos muy limitados, como dispositivos embebidos o CPU.
- Prototipado de separación en mezclas de muchas fuentes: el diseño de 8 ranuras permite experimentar con escenarios de hasta 8 fuentes combinadas a partir de escenas de 1 a 4 fuentes.

## Benchmarks y rendimiento

Los datos publicados corresponden a métricas de desarrollo, no a un test independiente. El autor advierte explícitamente que no deben presentarse como rendimiento de test no sesgado.

| Medicion | Checkpoint | Valor (dB) |
|---|---|---|
| MixIT en señal de entrenamiento (media de 20 minibatches) | model.safetensors (paso 6000) | 14,6156 |
| MixIT en conjunto de entrenamiento (64 pares fijos) | model.safetensors (paso 6000) | 12,8718 |
| MixIT en desarrollo holdout (64 pares fijos) | model.safetensors (paso 6000) | 12,5957 |
| SI-SDRi de fuentes en desarrollo (653 escenas multi-fuente) | model.safetensors (paso 6000) | 9,5535 (IC 95%: 8,9898–10,1371) |
| MixIT en señal de entrenamiento | final.safetensors (paso 8000) | 13,7025 |
| MixIT en desarrollo holdout | final.safetensors (paso 8000) | 13,0650 |
| SI-SDRi de fuentes uno a uno (10 s) | final.safetensors (paso 8000) | 11,8779 (IC 95%: 11,3462–12,3981) |
| SI-SDR absoluto de fuentes (10 s) | final.safetensors (paso 8000) | 5,9982 |

Selección de checkpoints por SI-SDRi de fuentes en desarrollo:

| Actualizacion de fine-tune | SI-SDRi de fuentes en desarrollo (dB) | Pesos |
|---|---|---|
| 6000 | 9,5535 | `checkpoints/step-00006000.safetensors` |
| 3000 | 9,5096 | `checkpoints/step-00003000.safetensors` |
| 8000 | 9,4240 | `checkpoints/step-00008000.safetensors` |
| 7000 | 9,3307 | `checkpoints/step-00007000.safetensors` |
| 2000 | 9,3062 | `checkpoints/step-00002000.safetensors` |

En la evaluación final a 10 segundos se reportan 742 escenas multi-fuente activas de 1.000. El autor indica que estas cifras reutilizan datos de desarrollo y que los intervalos no corrigen la selección de modelo ni de receta. No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas internas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,29 M de parámetros en BF16, el peso del modelo ocupa del orden de unos pocos megabytes, por lo que la VRAM vendrá dominada por los buffers de STFT y las activaciones del audio de entrada.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A100 de 80 GB, pero para inferencia el modelo es lo bastante pequeño como para ejecutarse en GPUs consumer; no se especifican modelos concretos.
- ¿Cabe en GPU consumer? Sí, por tamaño de parámetros; no se documentan requisitos mínimos ni pruebas en GPUs concretas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repo usa PyTorch 2.7.1 y safetensors, con STFT y síntesis en FP32.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la información proporcionada para establecer una comparativa cuantitativa con otros separadores MixIT o TF-Locoformer. Como referencia cualitativa, el propio modelo base `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1` es la alternativa directa, del que este fine-tune deriva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed1 | 1.293.568 | 6 s (10 s en evaluación final) | public-access-no-weight-license-grant | Hugging Face, safetensors |
| mixit-fuss-tflocoformer-m8-plain-seed1 (modelo base) | no disponible | no disponible | no disponible | Hugging Face, safetensors |
| Otros separadores MixIT/TF-Locoformer | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se realizó evaluación en test independiente; todas las métricas son de desarrollo y están sesgadas por la selección de checkpoint sobre la misma cohorte.
- Las etiquetas de fuente se usaron para seleccionar checkpoints y desarrollar la receta, aunque no en la función de pérdida; esto puede inflar las cifras reportadas.
- Las 8 ranuras de salida son no ordenadas y no corresponden a clases semánticas: no debe asumirse que la ranura 1 sea siempre el mismo hablante o fuente.
- Limitado a audio mono a 8 kHz, lo que restringe su uso a voz y audio de banda estrecha; no apto para música de alta fidelidad ni audio de banda ancha.
- Modelo no causal y offline: no sirve para separación en tiempo real con latencia estricta.
- La licencia `public-access-no-weight-license-grant` es restrictiva y debe revisarse en `LICENSE-WEIGHTS.md` antes de cualquier uso, incluido el comercial; no se garantiza permiso de uso de los pesos.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de artefactos: la consistencia exacta de mezcla y las puntuaciones MixIT altas no garantizan una buena recuperación de fuentes individuales.
- El modelo solo declara el idioma `en` en sus metadatos; no hay evidencia de comportamiento en otros idiomas ni en dominios acústicos distintos de FUSS.
- Los números de la evaluación a 10 segundos no son comparables con los del protocolo de selección a 4 segundos; el autor lo advierte explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed1
- Modelo base: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1
- Revisión concreta del modelo base: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1/tree/7eba74ff4f81c9fc04bbcc4badd4959ab95555cd
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed1/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper de referencia (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
