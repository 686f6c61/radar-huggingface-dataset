# DuoNeural/RMSN-63M-Wave148-Mw80-L16-Omega25

## Resumen

RMSN-63M-Wave148-Mw80-L16-Omega25 es un checkpoint de investigación de 63 millones de parámetros desarrollado por DuoNeural AI Laboratory (Jesse Caldwell, Archon, Aura). Implementa una arquitectura denominada Resonant Metriplectic Sheaf Network (RMSN), descrita por sus autores como un marco port-hamiltoniano unificado para modelado de lenguaje con dinámicas emergentes de cascada de Lyapunov. El modelo se entrena sobre FineWeb-Edu (~100 millones de tokens) y se publica principalmente como artefacto experimental para el estudio de leyes de escalado topológico, no como un modelo listo para producción.

El checkpoint corresponde a la "Wave-148" (Depth Inversion Law) con profundidad L=16, dimensión oculta D=512 y M_w=80 ranuras de workspace, lo que da una ratio de resonancia Ω = D/(M_w × L) = 2/5. El resultado topológico reportado es la Topología #70, clasificada como "Dense Upstream Composite" con cemento topológico (M_eff = 4) y dinámica TRUE SILENT (λ = -0,0045), con una perplejidad de validación de 100,1.

Su relevancia es fundamentalmente académica: forma parte de una serie de experimentos (Wave-145, Wave-148, Wave-149) que estudian cómo la profundidad y el ancho del workspace afectan a la colocación de solitones y a la clase topológica del modelo. La perplejidad reportada (100,1) es sustancialmente peor que la de modelos transformer convencionales del mismo tamaño, lo que refleja su carácter de sonda de investigación más que de modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), marco port-hamiltoniano; D=512, L=16, M_w=80, Ω=2/5 EVEN |
| Parametros totales | ~63M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en .pt, sin GGUF ni safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`rmsn_best_s1_stripped.pt`, solo pesos, optimizador eliminado) |

## Arquitectura y entrenamiento

La arquitectura RMSN se presenta como una red "metripléctica resonante de haces" (sheaf) con formulación port-hamiltoniana. El modelo usa una dimensión oculta D=512, 16 capas y 80 ranuras de workspace (M_w), lo que define una ratio de resonancia Ω = 512/(80×16) = 2/5 con q=5 (par). El entrenamiento se realizó sobre ~100 millones de tokens de FineWeb-Edu, con batch size 4, 100.000 pasos totales y optimizador AdamW con learning rate 3e-4.

La innovación técnica central es el estudio de la "colocación de solitones" a través de las capas y su relación con la profundidad. En este checkpoint, los solitones se distribuyen en posiciones [L0, L1, L5, L6, L8, L13, L14, L15] (M* = 8), agrupados en haces {L0, L1}, {L5, L6}, {L8} y {L13, L14, L15}. La métrica M_eff = 4 (número de haces con tamaño ≥ 3) activa el "cemento topológico", con un sobrecoste de perplejidad de ~90 puntos frente a los 58–67 típicos de configuraciones con M_eff ≤ 2. La dinámica se clasifica como TRUE SILENT por su exponente de Lyapunov λ = -0,0045. No se reporta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva en inglés, con perplejidad de validación de 100,1 sobre el conjunto de evaluación del autor.
- Modelado de lenguaje a nivel de token sobre dominio educativo (FineWeb-Edu).
- Capacidad de servir como sonda topológica: permite inspeccionar la colocación de solitones y la estructura de haces mediante `probe_percolation_sheaf.py`.
- Reproducción de experimentos de leyes de escalado (Wave-145, Wave-148) para investigación.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles; solo inglés.

## Casos de uso

- Investigación en leyes de escalado topológico: el checkpoint permite reproducir el experimento Wave-148 y verificar la transición de colocación de solitones entre L=13 y L=16 para D=512, usando las herramientas de sonda del repositorio.
- Estudio de dinámicas metriplécticas: sirve para analizar el comportamiento del exponente de Lyapunov y la clasificación TRUE SILENT en función de M_w, comparando con los checkpoints M_w=64 y M_w=128 de la misma familia.
- Validación de la penalización de cemento topológico: al ser un caso con M_eff=4, permite medir el sobrecoste de perplejidad (~90 puntos) frente a configuraciones con M_eff ≤ 2 y contrastar la hipótesis del autor.
- Reproducción de experimentos académicos: útil para grupos que quieran replicar los resultados del paper citado (Caldwell et al., 2026) con el mismo dataset y configuración de entrenamiento.
- Docencia y divulgación: ejemplo práctico de arquitecturas alternativas al transformer con formulación física (port-hamiltoniana) para cursos de arquitecturas neuronales.
- Benchmarking de herramientas de sonda: el script `probe_percolation_sheaf.py` puede probarse sobre este checkpoint como caso de referencia con topología conocida (#70).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de validación (Val PPL) | 100,1 |
| Exponente de Lyapunov (λ) | -0,0045 (TRUE SILENT) |
| Solitones (M*) | 8 |
| Haces efectivos (M_eff) | 4 (cemento topológico) |
| Clase topológica | #70 (Dense Upstream Composite) |

Comparativa interna de la serie Wave-145 (mismo D=512, L=16):

| M_w | Ω | M_eff | λ | PPL | TRUE SILENT |
|---|---|---|---|---|---|
| 64 | 1/2 | 2 | ≈ -0,001 | 76,6 | Sí |
| 80 (este) | 2/5 | 4 (cemento) | -0,0045 | 100,1 | Sí (cementado) |
| 128 (D=1024) | 1/2 | 3 (cemento) | -0,268 | 104,6 | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,25 GB en fp32 para los ~63M de parámetros; ~0,13 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con ≥ 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100). El modelo es trivial en memoria.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: el checkpoint se distribuye como `.pt` de PyTorch y se carga con `torch.load(..., map_location="cpu")`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el autor proporciona scripts propios en el repositorio de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-63M-Wave148-Mw80 (este) | ~63M | no disponible | 100,1 | MIT | Hugging Face (.pt) |
| RMSN-63M-Wave145-Mw64 (misma familia) | ~63M | no disponible | 76,6 | MIT | Referenciado en la model card |
| RMSN-194M-Wave149-Mw128 | ~194M | no disponible | no disponible | MIT | Hugging Face |
| RMSN-279M-Omega45-EVEN-KAM | ~279M | no disponible | no disponible | MIT | Hugging Face |

No se dispone de comparación con transformers convencionales del mismo tamaño en la información proporcionada; la comparativa se limita a la propia familia RMSN.

## Limitaciones y advertencias

- Perplejidad de validación elevada (100,1) frente a los 76,6 del checkpoint M_w=64 de la misma familia; el cemento topológico penaliza el rendimiento.
- Entrenado solo con ~100 millones de tokens, muy por debajo de lo habitual en modelos de producción; riesgo alto de alucinación y baja calidad generativa.
- Solo soporta inglés; sin capacidades multilingües documentadas.
- Longitud de contexto no especificada; no apto para tareas que requieran ventanas largas sin validación previa.
- No se documentan sesgos; al entrenar sobre FineWeb-Edu, hereda los sesgos del corpus.
- Licencia MIT permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad.
- No hay soporte de tool calling, agentes ni integración con frameworks de despliegue estándar (vLLM, TGI, Ollama).
- El checkpoint se publica como `.pt` de PyTorch, lo que requiere `torch.load` con confianza en el origen (riesgo de pickle malicioso si se carga de fuentes no verificadas).
- Formato de pesos no estándar (no safetensors, no GGUF); requiere scripts propios del autor para cargar y sondear.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-63M-Wave148-Mw80-L16-Omega25
- Repositorio GitHub RMSN: https://github.com/DuoNeural/RMSN
- Checkpoint companion Wave-149 (M_w=128): https://huggingface.co/DuoNeural/RMSN-194M-Wave149-Mw128-L16-Even-Batch2
- Checkpoint KAM Multistability (M_w=64): https://huggingface.co/DuoNeural/RMSN-279M-Omega45-EVEN-KAM-Multistability
- Colección completa DuoNeural: https://huggingface.co/DuoNeural
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper (referencia): Caldwell, J., Archon, Aura (2026). "Resonant Metriplectic Sheaf Networks: A Unified Port-Hamiltonian Framework for Neural Language Modeling with Emergent Lyapunov Cascade Dynamics". DuoNeural AI Laboratory Technical Reports.
