# pottokao/SNES-LoRA-Qwen3.8-27B

## Resumen

SNES-LoRA-Qwen3.8-27B es un adaptador LoRA desarrollado por pottokao que proporciona competencia específica en el dominio de la consola Super Famicom (SNES) sobre el modelo base Qwen3.8-27B. El adaptador, entrenado con 1.856 registros verificados, cubre modismos de C de PVSnesLib, particularidades del hardware SNES, arte y música orientados a la consola. No es un generador de juegos autónomo: forma parte de un sistema agente más amplio (snes-lora-agent-qwen3.8-27b) que combina el LLM base, este adaptador y herramientas Python para compilar, ejecutar y verificar ROMs `.sfc` reales.

El proyecto resuelve el problema de que los modelos de lenguaje generales carecen de conocimiento especializado sobre el desarrollo para SNES (registros, modos gráficos, formato BRR, limitaciones de memoria), y lo aborda mediante un adaptador ligero (1.3 GB) entrenado exclusivamente con datos verificados y con licencias permisivas. Su relevancia actual radica en la tendencia de generación de videojuegos retro asistida por IA, aunque su alcance es limitado: solo añade una capa de dominio, no capacidades generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.8-27B (transformador denso con codificador de visión) |
| Parámetros totales | No disponible (adaptador LoRA, rank 64, alpha 64; peso del repositorio: 1.3 GB) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | Heredada del base Qwen3.8-27B: 262.000 tokens nativos (según datos del fabricante) |
| Tipos de cuantización | El adaptador está en bf16 (safetensors); el base puede cuantizarse (p. ej., NVFP4 según el autor) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | MIT (adaptador); base Qwen3.8-27B bajo Apache 2.0; datos de entrenamiento MIT/CC0/autoría propia |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros con 64 capas y capacidades multimodales nativas (visión y texto). La LoRA usa rango 64 y alpha 64, y modifica las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, lo que permite ajustar el modelo sin reentrenar todos los pesos. El entrenamiento se realizó con el conjunto `sft_sfc_all.jsonl`, compuesto por 1.856 registros, todos verificados antes de su inclusión: los ejemplos de código compilan o pasan las pruebas, la música se verifica mediante round-trip y el arte se construye en formato CHR. La distribución de datos es: arte (924 registros, assets CC-BY), código (664 registros, homebrew MIT y ejemplos del SDK PVSnesLib bajo zlib), efectos de sonido (100 registros sintetizados), música (59 registros), juegos completos verificados (57), documentación de hardware (32), ejemplos compilados (15) y correcciones de problemas conocidos (5). No se menciona el uso de RLHF ni DPO; el enfoque es un ajuste fino supervisado (SFT) con verificación automatizada.

## Capacidades

- Generación de código C específico para PVSnesLib: modismos, configuración de registros y patrones de desarrollo para SNES.
- Conocimiento de hardware SNES: modos gráficos, paletas, DMA, formato de audio BRR, limitaciones de memoria y trampas comunes.
- Creación de arte en formato SNES CHR a partir de descripciones de píxeles, basado en bibliotecas de assets CC0.
- Composición musical simplificada: generación de jingles en notación jianpu multicanal con verificación de round-trip.
- Síntesis de efectos de sonido parametrizados hacia formato BRR.
- Capacidades generales del base Qwen3.8-27B: razonamiento, lógica de juego, visión y comprensión multimodal (heredadas, no añadidas por el adaptador).
- Sin soporte directo de tool calling ni función de agente autónomo: depende del sistema agente externo para compilar, ejecutar y verificar.

## Casos de uso

- Desarrollo de homebrew para SNES: el adaptador permite al modelo generar esqueletos de código PVSnesLib correctos, evitando errores comunes de inicialización de hardware. Se usaría dentro del agente para producir código que luego se compila con la cadena de herramientas.
- Generación de arte para ROMs: convierte descripciones textuales en bloques CHR válidos, útil para prototipar sprites y tilesets sin edición manual.
- Composición de música retro: genera jingles multicanal en notación jianpu que se convierten en secuencias de audio BRR, con verificación automática para evitar fallos de síntesis.
- Documentación y consulta técnica: el adaptador responde preguntas sobre registros y especificaciones SNES basándose en datos de SNESdev y fullsnes, útil como referencia integrada en entornos de desarrollo.
- Corrección de errores en código existente: los datos de `pothole-fix` permiten sugerir soluciones a problemas conocidos de hardware, como conflictos de DMA o mal uso de modos gráficos.
- Prototipado rápido de juegos completos: combinado con el agente, permite pasar de un prompt a una ROM `.bin` ejecutable y verificada, para demos o juegos de jam.
- Aprendizaje y formación: sirve como asistente para desarrolladores que se inician en SNES, explicando modismos y restricciones de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval ni otros estándares para el adaptador. El rendimiento se evalúa de forma práctica mediante la verificación de que el código generado compila y se ejecuta en un emulador (Mesen2), no mediante benchmarks académicos.

## Requisitos de hardware

- El adaptador LoRA pesa 1.3 GB, por lo que su carga adicional es mínima; el requisito dominante es el del modelo base Qwen3.8-27B.
- Para inferencia del base en bf16 se necesitan aproximadamente 54 GB de VRAM (27B × 2 bytes), lo que requiere una GPU de 48 GB o más (p. ej., A100 80 GB, H100).
- Con cuantización NVFP4, el autor del proyecto ha desplegado el base en dos GPU de consumo de 16 GB (2× RTX 5070 Ti) usando vLLM con tensor parallelism, alcanzando un contexto real de 160K tokens.
- En una sola GPU de consumo de 24 GB (p. ej., RTX 3090/4090) no cabe el base completo en bf16; se necesitaría cuantización a 8 bits o menos, con pérdida de calidad.
- Despliegue recomendado: vLLM con soporte LoRA (`--enable-lora`), tal como se muestra en la documentación del proyecto; también es compatible con otros endpoints compatibles con OpenAI.
- La latencia depende del hardware y del tamaño del contexto; el autor reporta que el base con NVFP4 y MTP alcanza un throughput razonable para desarrollo interactivo, pero no hay datos numéricos específicos para el adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SNES-LoRA-Qwen3.8-27B | LoRA sobre Qwen3.8-27B | Adaptador 1.3 GB (base 27B) | 262K (heredado) | Apache 2.0 (adaptador MIT) | HuggingFace |
| nes-lora-for-qwen3.8-27b (proyecto hermano) | LoRA sobre Qwen3.8-27B | No disponible | No disponible | No especificada | GitHub |
| TeichAI/Qwen3.8-27B-Fable-Distill-LoRA | LoRA sobre Qwen3.8-27B | No disponible | No disponible | No disponible | HuggingFace |

No existen adaptadores comparables publicados para SNES; los proyectos similares (como el LoRA para NES del mismo autor) siguen el mismo patrón de dominio específico, pero no hay datos de rendimiento para comparar. El modelo base Qwen3.8-27B es el punto de comparación común.

## Limitaciones y advertencias

- El adaptador no genera juegos por sí mismo; requiere el sistema agente Python completo para compilar, ejecutar y verificar ROMs.
- Está ligado al base Qwen3.8-27B: si se cambia el modelo base, el adaptador deja de funcionar.
- El conocimiento del dominio se limita a los datos de entrenamiento (1.856 registros); puede haber lagunas en hardware no cubierto o casos raros.
- Riesgo de alucinación en código o datos técnicos; la verificación automatizada del agente es esencial para detectar errores.
- No se han publicado evaluaciones de sesgos ni de robustez; el dataset incluye arte CC0 y código MIT, pero la composición de los datos puede introducir sesgos de estilo.
- La licencia MIT del adaptador no cubre los datos de entrenamiento: hay que mantener la atribución de fuentes upstream (MIT, CC0, autoría propia).
- El proyecto no incluye ROMs, BIOS ni arte de Nintendo; es no oficial y no está afiliado a Nintendo.
- Los datos de contexto de 262K son del fabricante del base; no se ha verificado que el adaptador funcione correctamente en contextos largos.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/pottokao/SNES-LoRA-Qwen3.8-27B
- Repositorio del agente (GitHub): https://github.com/pottokao-dotcom/snes-lora-agent-qwen3.8-27b
- Proyecto hermano para NES (GitHub): https://github.com/pottokao-dotcom/nes-lora-for-qwen3.8-27b
- Cuantización NVFP4 del base (HuggingFace): https://huggingface.co/pottokao/Qwen3.8-27B-NVFP4-MTP-2x16GB
- Referencia del base Qwen3.8-27B: https://neomanex.com/models/qwen3-8-27b
- Otro LoRA sobre el base: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill-LoRA
