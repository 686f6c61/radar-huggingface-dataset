# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-FullMix-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-Dev-FullMix-GGUF es una compilación en formato GGUF de un ajuste fino del modelo multimodal LiquidAI/LFM3-VL-2B, orientado a la automatización de interfaces gráficas en dispositivos Android. Lo desarrolla el usuario experimentalmachines y se publica como modelo de investigación para reproducir resultados de un agente móvil que opera a partir de capturas de pantalla y objetivos en lenguaje natural. El repositorio contiene los pesos cuantizados a 4 bits (Q4_K_M) junto con el proyector visual en Q8_0, listos para su uso con llama.cpp.

El modelo parte de una arquitectura de lenguaje de aproximadamente 1.730 millones de parámetros (1.728.801.600 según los pesos en safetensors) con una torre de visión acoplada, y está especializado en la tarea image-text-to-text: recibe una captura de pantalla y un objetivo textual, y emite la siguiente acción sobre la interfaz. Su relevancia radica en que demuestra un flujo completo de agente móvil ejecutable en hardware modesto mediante GGUF, aunque el propio autor lo marca explícitamente como modelo de desarrollo no recomendado para uso real.

La ficha corresponde a una versión de desarrollo ("Dev") cuyo propósito es la reproducibilidad de resultados, no la producción. El autor recomienda emplear en su lugar el modelo LFM3-VL-2B-MobileAgent. La licencia heredada es la LFM Open License v1.0, y el idioma de trabajo es únicamente el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de visión con proyector), ajuste fino de LiquidAI/LFM3-VL-2B |
| Parámetros totales | 1.728.801.600 (≈1,73 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de servicio con llama-server) |
| Tipos de cuantización | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector visual (mmproj) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (LFM3-VL-2B-MobileAgent-Dev-FullMix-Q4_K_M.gguf y mmproj-LFM3-VL-2B-Q8_0.gguf) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del multimodal LFM3-VL-2B de LiquidAI, que combina un modelo de lenguaje transformer con una torre de visión y un proyector que alinea las representaciones visuales con el espacio del lenguaje. El ajuste fino se centró en el modelo de lenguaje: según la model card, la torre de visión no fue modificada y el proyector mmproj es idéntico al publicado en LiquidAI/LFM3-VL-2B-GGUF.

El entrenamiento se realizó exclusivamente sobre demostraciones grabadas; el modelo nunca interactuó con un teléfono real durante el entrenamiento. El formato de entrada sigue el arnés de AndroidWorld con un historial de 24 pasos y notas de tipo "[no visible change]", y cada paso utiliza una única captura de pantalla. La conversión a GGUF se hizo con llama.cpp (commit cd959bae9), mediante convert_hf_to_gguf.py a F16 y posterior cuantización Q4_K_M; el autor indica que todos los tensores son idénticos a los del GGUF construido previamente a partir de los mismos pesos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Comprensión de capturas de pantalla de Android y generación de la siguiente acción sobre la interfaz (image-text-to-text).
- Ejecución de tareas guiadas por objetivos en lenguaje natural (en inglés).
- Razonamiento multi-paso con historial de hasta 24 pasos de interacción previa.
- Manejo de notas de ausencia de cambio visible ("[no visible change]") para evitar bucles de acción.
- Formato de razonamiento compatible con la opción --reasoning-format deepseek de llama.cpp.
- Capacidades conversacionales básicas heredadas del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en agentes móviles: reproduce experimentos de AndroidWorld con el arnés indicado (--history_steps 24 --nochange_notes) para comparar resultados con otras variantes del proyecto.
- Evaluación de pipelines de automatización de GUI: sirve como referencia para medir la viabilidad de un agente de 2B parámetros en tareas de navegación de aplicaciones.
- Desarrollo de prototipos de asistencia en dispositivos: permite probar en local, con llama.cpp, la interacción basada en capturas de pantalla antes de pasar a modelos mayores.
- Docencia y experimentación con modelos multimodales pequeños: su tamaño (1,3 GB en el repositorio GGUF) facilita desplegarlo en entornos de laboratorio con recursos limitados.
- Pruebas de cuantización y despliegue: útil para validar flujos de conversión HF→GGUF y cuantización Q4_K_M con modelos multimodales.
- Comparación de estrategias de memoria visual: al mantener el proyector visual sin cambios, permite aislar el efecto del ajuste fino del modelo de lenguaje en tareas de agente.
- Validación de formatos de razonamiento: sirve para comprobar la integración de --reasoning-format deepseek en llama-server con modelos pequeños.

## Benchmarks y rendimiento

El autor menciona una ejecución exploratoria en AndroidWorld: 21 de 116 tareas completadas con la semilla de desarrollo 30. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Benchmark | Resultado | Contexto |
|---|---|---|
| AndroidWorld (semilla 30) | 21/116 tareas | Ejecución exploratoria con el GGUF construido el 2026-11-24 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para los pesos Q4_K_M más el proyector Q8_0; con contexto de 8192 tokens y caché KV, el consumo se sitúa en torno a 2-3 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media y en muchos dispositivos con suficiente memoria unificada; el tamaño reducido lo hace apto para hardware modesto.
- Opciones de despliegue: llama.cpp (llama-server), con los ficheros Q4_K_M y mmproj Q8_0; el ejemplo de servicio usa -c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-FullMix-GGUF | ≈1,73 B | 8192 | en | LFM Open License v1.0 | GGUF | Versión de desarrollo, no recomendada |
| LFM3-VL-2B-MobileAgent | no disponible | no disponible | en | LFM Open License v1.0 | no disponible | Versión recomendada por el autor |
| LiquidAI/LFM3-VL-2B | ≈1,73 B (base) | no disponible | no disponible | LFM Open License v1.0 | safetensors / GGUF | Modelo base multimodal sin ajuste para agente móvil |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de que no debe dejarse actuar de forma desatendida en un teléfono con cuentas, mensajes o pagos reales.
- Solo admite objetivos en inglés y una única captura de pantalla por paso.
- Entrenado únicamente con demostraciones grabadas; nunca ha interactuado con un dispositivo real durante el entrenamiento, lo que puede limitar su robustez ante estados no vistos.
- Estado de desarrollo: el autor no lo recomienda y sugiere usar LFM3-VL-2B-MobileAgent en su lugar.
- Riesgo de alucinación en la interpretación de capturas de pantalla y en la elección de acciones, no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia LFM Open License v1.0: conviene revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones.
- Dependencia del arnés de AndroidWorld (historial de 24 pasos y notas de no cambio) para reproducir el comportamiento esperado.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-FullMix-GGUF
- Modelo base del ajuste fino: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-FullMix
- Versión recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guía de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentación de modelos: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md
