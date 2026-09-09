# Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-base-mlx

## Resumen

El modelo `Qwen3.8-27B-Atlassian-Q8-base-mlx` es un checkpoint de cuantizacion 8-bit de `Qwen/Qwen3.8-27B`, preparado en formato MLX (Apple Silicon) por el desarrollador LeanZero (Mihai-LeanZero). Se trata de la base sin entrenar sobre la que LeanZero entrenó sus modelos especializados en el ecosistema Atlassian (Jira, Confluence, Forge). El propósito principal de esta publicación es ofrecer una base reproducible y de alta calidad para que otros desarrolladores puedan aplicar sus propios adaptadores LoRA o entrenar sus propios modelos.

El modelo mantiene la arquitectura original de Qwen3.8-27B, un transformer de aproximadamente 27.356.728.560 parámetros (27,36B). Su característica distintiva es la inclusión de un archivo sidecar `mtp.safetensors` con la cabeza de predicción multi-token (MTP) en bf16, que permite decodificación especulativa en motores compatibles como Rapid-MLX o goose local edition. La cuantización es affine de 8 bits con grupo de tamaño 64, logrando una calidad medida casi idéntica al modelo original en bf16 (divergencia KL top-1024 de 0.0446 y acuerdo top-1 de 99.35%). No se ha realizado ningún entrenamiento adicional sobre esta base, por lo que sus capacidades son las heredadas del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con cabeza MTP en sidecar |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (las pruebas del autor mencionan 32k) |
| Tipos de cuantizacion | MLX 8-bit affine (grupo 64); en la familia: Q6, Q4 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, incluye mtp.safetensors sidecar) |

## Arquitectura y entrenamiento

El modelo es un checkpoint cuantizado de `Qwen/Qwen3.8-27B`. El autor indica explícitamente que no hubo entrenamiento: se trata de la base "sin tocar", con la única modificación del layout de la cabeza MTP. La cuantización se realizó con mlx-node y mlx-lm usando la receta `qwen3_5`, produciendo un checkpoint affine de 8 bits con grupo de tamaño 64 y un tamaño aproximado de 30 GB en disco.

La innovación técnica más relevante es el archivo `mtp.safetensors`: la cabeza de predicción multi-token del modelo original, conservada en bf16 y enviada como sidecar. Esto permite que motores que implementan MTP (como Rapid-MLX, un fork de LeanZero, o goose local edition) realicen decodificación especulativa de forma nativa, mientras que otros motores simplemente ignoran el archivo sin afectar a la carga del modelo. La calidad de la cuantización fue validada comparando la salida del modelo con la del maestro en bf16, obteniendo una divergencia KL de 0.0446 y un acuerdo top-1 de 99.35% en 200 prompts congelados.

## Capacidades

- Generación de texto y código: al ser un modelo base sin entrenar, hereda las capacidades generales de Qwen3.8-27B para razonamiento, generación de texto y código.
- Modo de razonamiento ("thinking"): el README del autor sugiere parámetros de muestreo específicos para modo thinking (temperatura 1.0, top_p 0.95, top_k 20).
- Soporte de tool calling: el autor indica un parser `qwen3_coder_xml` para tool calling en motores compatibles, lo que sugiere capacidad funcional heredada del modelo base.
- Decodificación especulativa: gracias al sidecar MTP, puede acelerar la inferencia en motores compatibles.
- Capacidades multilingües: el modelo está etiquetado solo en inglés, aunque el modelo base original podría soportar más idiomas; no hay información al respecto en esta publicación.
- Sin entrenamiento específico: el modelo no conoce prácticamente nada sobre el dominio Atlassian (el autor reporta 2 de 13 y 3 de 13 en sondas de identificación de Forge, y 0 de 25 manifiestos válidos).

## Casos de uso

- Reproducibilidad de experimentos: este checkpoint permite a investigadores replicar exactamente los resultados de LeanZero, ya que se publica con la misma cuantización y layout que los modelos entrenados de la familia.
- Punto de partida para fine-tuning: es la base ideal para aplicar adaptadores LoRA u otros métodos de entrenamiento, especialmente para tareas específicas del ecosistema Atlassian.
- Evaluación de técnicas de cuantización: sirve como referencia para comparar la calidad de 8-bit frente a otras recetas (Unsloth 6-bit, lmstudio-community) mediante métricas como KL divergence y acuerdo top-1.
- Inferencia en Apple Silicon: al estar en formato MLX, puede desplegarse eficientemente en Mac con chip Apple Silicon (por ejemplo, Mac Studio M3 Ultra) usando mlx-lm, LM Studio o Rapid-MLX.
- Desarrollo de agentes con tool calling: el soporte del parser `qwen3_coder_xml` permite integrar el modelo en aplicaciones de agentes en motores compatibles, aunque se recomienda usar la versión entrenada para tareas de Atlassian.
- Benchmarking de decodificación especulativa: el sidecar MTP permite medir la aceleración de la inferencia en motores que implementan MTP, con resultados reportados de 1.55x en contexto corto y 1.22x a 32k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sin embargo, el autor proporciona métricas de fidelidad frente al modelo maestro en bf16 y datos de rendimiento de decodificación:

| Metrica | Qwen3.8-27B-Atlassian-Q8-base-mlx | lmstudio-community 8-bit | Unsloth 6-bit |
|---|---|---|---|
| Divergencia KL (top-1024) | 0.0446 | 0.0453 | 0.0591 |
| Acuerdo top-1 | 99.35% | 99.34% | 98.90% |

| Configuracion | Tokens/segundo |
|---|---|
| Decode plano (Rapid-MLX, M3 Ultra) | 22.6 tok/s |
| Decode con MTP (contexto corto) | 35.1 tok/s |
| Decode con MTP (32k contexto) | 1.22x frente a plano |
| DFlash2 drafter | 2.08x frente a plano |

## Requisitos de hardware

- VRAM estimada: no disponible en valor exacto; el modelo ocupa aproximadamente 30 GB en disco (32.7 GB el repo), por lo que se requiere al menos 32 GB de memoria unificada en Apple Silicon para cargarlo correctamente.
- GPU recomendadas: el formato MLX está optimizado para chips Apple Silicon. El autor utilizó una Mac Studio con M3 Ultra para las pruebas de rendimiento.
- Compatibilidad con GPU de consumo: no aplicable directamente, ya que el formato MLX no es compatible con CUDA. Para entornos NVIDIA se necesitaría convertir el modelo a otro formato (no proporcionado en esta publicación).
- Opciones de despliegue: Rapid-MLX (fork de LeanZero), goose local edition, LM Studio y mlx-lm. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia estimada: 22.6 tok/s en decodificación plana; hasta 35.1 tok/s con MTP en contexto corto, en Mac Studio M3 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Atlassian-Q8-base-mlx | 27,36B | no disponible | MLX 8-bit affine | Apache-2.0 | HuggingFace, MLX |
| Qwen3.8-27B (base original) | 27,36B | no disponible | bf16 | Apache-2.0 | HuggingFace |
| lmstudio-community/Qwen3.8-27B-MLX-8bit | 27,36B | no disponible | MLX 8-bit | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-Atlassian-Q6-mlx | 27,36B | no disponible | MLX 6-bit | Apache-2.0 | HuggingFace (familia LeanZero) |

Las diferencias principales frente al checkpoint de lmstudio-community son la inclusión del sidecar MTP y el proceso de cuantización/muestreo utilizado. En términos de calidad, los datos del autor muestran una diferencia mínima (0.0446 vs 0.0453 en KLD).

## Limitaciones y advertencias

- Este es un modelo base sin entrenamiento específico: no conoce el dominio Atlassian. El autor reporta resultados muy bajos en sondas de identificación de Forge (2 de 13 y 3 de 13) y 0 de 25 manifiestos válidos.
- Para uso en producción en tareas de Atlassian, se recomienda la versión entrenada de la misma familia, no esta base.
- Riesgo de alucinación: al ser un modelo general, puede generar contenido plausible pero incorrecto, especialmente en dominios no cubiertos por la documentación de Qwen3.8-27B.
- Restricciones técnicas: no ejecutar `mlx convert` con esta carpeta sin la opción `-q`, ya que mlx-node documenta que se elimina el cero y se rompe la carga.
- No renombrar `mtp.safetensors` para que coincida con los nombres de `model*.safetensors`: mlx-lm lo leería como parte del backbone y desplazaría las normas dos veces.
- Licencia Apache-2.0: permite uso comercial, pero el autor no garantiza que el modelo cumpla requisitos específicos de cumplimiento normativo; se deben verificar las condiciones del modelo base original.
- Idiomas: la etiqueta de la publicación indica solo inglés; puede haber limitaciones en otros idiomas no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-base-mlx
- Write-up de LeanZero: https://leanzero.net/portfolio/atlassian-models
- Repositorio Rapid-MLX: https://github.com/leanzero-srl/Rapid-MLX
- Projecto CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Servicios de migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
