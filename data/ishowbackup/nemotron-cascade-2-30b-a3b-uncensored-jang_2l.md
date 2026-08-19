# Ishowbackup/Nemotron-Cascade-2-30B-A3B-UNCENSORED-JANG_2L

## Resumen

Este modelo es una versión cuantizada y sin censura del **Nemotron Cascade 2 30B** de NVIDIA, adaptada por Ishowbackup para ejecutarse en Apple Silicon mediante el formato **JANG** (Jang Adaptive N-bit Grading), un equivalente de GGUF para MLX. El perfil aplicado es **JANG_2L**, con precisión mixta de 2 bits en los expertos, y se ha sometido a la técnica **CRACK** (Controlled Refusal Ablation via Calibrated Knockouts), que elimina permanentemente los mecanismos de rechazo de seguridad a nivel de pesos. El resultado es un modelo de 30B parámetros totales (3B activos) con arquitectura híbrida Mamba-2 SSM + MoE + Attention, optimizado para Macs con 16 GB de memoria. Su relevancia radica en combinar una arquitectura de vanguardia con la eliminación de guardarraíles, lo que lo hace útil para investigación en seguridad, generación de contenido sin restricciones y análisis de comportamientos adversarios, aunque su uso comercial está limitado por la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron Cascade 2 (Mamba-2 SSM + MoE con 128 expertos, top-6 + Attention) |
| Parametros totales | 30B (original); 5.054.804.544 en safetensors (cuantizado) |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_2L (precisión mixta, 2 bits en expertos) |
| Idiomas soportados | en (inglés) |
| Licencia | other (probablemente nvidia-open-model-license) |
| Formato de pesos | JANG, safetensors |

## Arquitectura y entrenamiento

El modelo base, **Nemotron-Cascade-2-30B-A3B** de NVIDIA, es un MoE con 30B parámetros totales y 3B activos, que combina tres tipos de capas: Mamba-2 SSM (para eficiencia en secuencias largas), MoE con 128 expertos y selección top-6, y atención tradicional. Fue post-entrenado a partir de Nemotron-3-Nano-30B-A3B-Base mediante **Cascade RL** y entrenamiento multi-dominio, logrando medallas de oro en IMO 2025, IOI 2025 y ICPC World Finals. Sobre esta base, Ishowbackup aplicó cuantización JANG_2L (2 bits en los expertos, manteniendo mayor precisión en atención y capas críticas) y la técnica CRACK, que calcula vectores proyectados por capa a partir de pares de prompts estructuralmente espejados para eliminar los pesos asociados al rechazo de seguridad. Según la model card, esta cirugía reduce el MMLU en aproximadamente un 5% respecto al modelo base, pero elimina por completo los guardarraíles.

## Capacidades

- Generación de texto en inglés con razonamiento de múltiples pasos.
- Soporte de **thinking mode** (activado por defecto, desactivable mediante ChatML).
- Capacidades de razonamiento matemático y lógico (el modelo base obtuvo medallas de oro en olimpiadas internacionales).
- Generación de código y soporte de tool calling (heredado del modelo base).
- Capacidad de seguir instrucciones complejas y conversaciones multi-turno.
- Sin restricciones de contenido: no rechaza peticiones de temas sensibles (abliterated).
- Optimizado para Apple Silicon mediante MLX, con alto throughput en Macs.

## Casos de uso

- **Investigación en seguridad de IA**: permite estudiar el comportamiento de un modelo sin guardarraíles, analizar sesgos o probar técnicas de jailbreak en un entorno controlado.
- **Generación de contenido creativo sin restricciones**: escritura de ficción, guiones o diálogos que aborden temas tabú sin filtros automáticos.
- **Simulación de escenarios adversarios**: útil para equipos de red teaming que necesitan generar prompts maliciosos o evaluar vulnerabilidades en sistemas de moderación.
- **Desarrollo de agentes de razonamiento**: su modo thinking y capacidad de tool calling permiten construir agentes que planifican y ejecutan tareas multi-paso en entornos de investigación.
- **Análisis de sesgos y alineación**: comparar las respuestas de este modelo con las del original para medir el impacto de la ablación de seguridad en la calidad del razonamiento.
- **Pruebas de estrés en entornos educativos**: generar ejemplos de contenido sensible para entrenar a moderadores o evaluar políticas de uso en plataformas.

## Benchmarks y rendimiento

Según la model card del autor, para la versión **JANG_2L**:

| Benchmark | Resultado |
|---|---|
| HarmBench | 99,7% |
| MMLU (con thinking) | 66,8% |
| Velocidad (M4 Ultra 256GB) | ~121 tok/s |

*Nota: los datos de HarmBench y MMLU provienen de la model card, que los reporta para la variante JANG_2L. No se han publicado resultados oficiales adicionales en la información disponible.*

## Requisitos de hardware

- **Memoria mínima**: 16 GB de RAM unificada en Macs (según la model card).
- **GPU recomendada**: Apple Silicon (M1 Pro o superior); el modelo está optimizado para MLX.
- **VRAM estimada**: ~10 GB en cuantización JANG_2L (según la model card), aunque el tamaño del repo es 18,3 GB (posiblemente incluye archivos adicionales).
- **Opciones de despliegue**: MLX Studio, `jang-tools` (paquete Python), o mediante `mlx_lm` con el cargador JANG.
- **Latencia/throughput**: ~121 tok/s en M4 Ultra 256GB; en Macs de 16 GB la velocidad será menor, pero aún utilizable para inferencia interactiva.

## Comparativa con modelos similares

| Modelo | Params totales | Activos | Contexto | MMLU | HarmBench | Licencia |
|---|---|---|---|---|---|---|
| Nemotron-Cascade-2-30B-A3B (base) | 30B | 3B | no disponible | 88% (JANG_4M base) | 0% | nvidia-open-model-license |
| Este modelo (JANG_2L CRACK) | 30B (5.05B cuant.) | 3B | no disponible | 66,8% | 99,7% | other |
| Nemotron-Cascade-2-30B-A3B-JANG_4M-CRACK | 30B (cuant.) | 3B | no disponible | 82,7% | 99,4% | other |

*Datos de MMLU y HarmBench para las versiones JANG provienen de la model card del autor. El modelo base no tiene datos de HarmBench publicados en esta información.*

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al eliminar los guardarraíles, el modelo puede generar contenido ofensivo, incorrecto o peligroso sin filtro. No es adecuado para uso en producción sin supervisión humana.
- **Riesgo de mal uso**: la licencia "other" probablemente restringe el uso comercial y puede prohibir aplicaciones dañinas. Revisar los términos exactos antes de usar.
- **Degradación del razonamiento**: la ablación CRACK reduce el MMLU en ~5% respecto al modelo base, afectando tareas que requieren razonamiento complejo.
- **Idioma limitado**: solo soporta inglés; no se garantiza calidad en otros idiomas.
- **Formato propietario**: JANG solo es compatible con MLX Studio y `jang-tools`; no funciona con librerías estándar como Transformers o llama.cpp.
- **Sin garantías de contexto**: la longitud de contexto no está documentada; se recomienda probar con secuencias cortas para evitar errores.

## Enlaces

- [HuggingFace: Ishowbackup/Nemotron-Cascade-2-30B-A3B-UNCENSORED-JANG_2L](https://huggingface.co/Ishowbackup/Nemotron-Cascade-2-30B-A3B-UNCENSORED-JANG_2L)
- [Modelo base: nvidia/Nemotron-Cascade-2-30B-A3B](https://huggingface.co/nvidia/Nemotron-Cascade-2-30B-A3B)
- [Página de investigación de Nemotron Cascade 2 (NVIDIA)](https://research.nvidia.com/labs/nemotron/nemotron-cascade-2/)
- [GitHub: NVIDIA-NeMo/Nemotron](https://github.com/NVIDIA-NeMo/Nemotron)
- [ModelScope: Nemotron-Cascade-2-30B-A3B](https://www.modelscope.cn/models/nv-community/Nemotron-Cascade-2-30B-A3B)
- [MLX Studio](https://mlx.studio)
- [Repositorio jangq (GitHub)](https://github.com/jjang-ai/jangq)
