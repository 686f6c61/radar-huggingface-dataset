# richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic

## Resumen

OLMo-2-0325-32B-Instruct-DiM-heretic es un ajuste fino del modelo allenai/OLMo-2-0325-32B-Instruct, desarrollado por richardyoung y publicado en Hugging Face. Se trata de una variante "abliterated" o "decensored": el objetivo declarado es eliminar los mecanismos de rechazo y censura del modelo original mediante técnicas de modificación de pesos (la etiqueta "heretic" hace referencia a la herramienta Heretic, orientada a la ablación de direcciones de rechazo en el espacio de activaciones). El modelo conserva la arquitectura y el tamaño del base, con 32.234.279.936 parámetros totales según los pesos en safetensors.

El modelo base, OLMo 2 32B Instruct, es un transformer decoder-only denso de AllenAI entrenado de forma totalmente abierta (datos, código y recetas publicados), con un contexto de 4.096 tokens en su versión Instruct. Este derivado mantiene esa arquitectura y añade una modificación orientada a reducir la tasa de respuestas rechazadas, lo que lo hace relevante para investigadores que estudian alineamiento, seguridad y comportamiento de modelos abiertos, así como para casos donde los filtros del modelo base resultan demasiado restrictivos.

La ficha se elabora a partir de la información disponible en la model card de Hugging Face; los detalles sobre el proceso exacto de ablación, los datos de ajuste y los resultados de evaluación no están documentados en la información proporcionada. El acceso es restringido (gated) y requiere aceptar condiciones en la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (OLMo 2) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base OLMo 2 32B Instruct emplea 4.096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (etiqueta del repo); el acceso esta restringido y requiere aceptar condiciones |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de OLMo 2 32B: un transformer decoder-only denso con atención completa, normalización RMSNorm no parametrizada (en OLMo 2), atención con RoPE y sin mezcla de expertos. No se dispone de información sobre posibles modificaciones estructurales respecto al base.

El ajuste realizado por richardyoung se etiqueta como "heretic", "uncensored", "decensored" y "abliterated", lo que indica una intervención sobre los pesos o las activaciones para suprimir la dirección de rechazo aprendida durante el alineamiento del modelo original. La model card referencia el dataset allenai/RLVR-GSM-MATH-IF-Mixed-Constraints y los papers arXiv:2501.00656 y arXiv:2411.15124, aunque no se detalla en la información disponible el número de tokens de ajuste, la composición exacta del dataset ni si se empleó DPO, RLHF u otra técnica. Tampoco se documenta el método concreto de ablación (por ejemplo, proyección ortogonal de direcciones de rechazo) ni el impacto medido sobre las capacidades del base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Instruct base.
- Razonamiento matemático y de tipo GSM/MATH, presumiblemente reforzado por el dataset de ajuste referenciado (RLVR-GSM-MATH-IF-Mixed-Constraints).
- Seguimiento de instrucciones (IF) en conversaciones multi-turno.
- Reducción de rechazos: el propósito declarado es responder a peticiones que el modelo base rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este derivado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo "thinking" o vision/audio: no disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: estudiar cómo cambia la tasa de rechazo y el comportamiento ante prompts sensibles tras la ablación, comparando con el OLMo 2 32B Instruct original.
- Evaluación de robustez de filtros: analizar qué tipos de peticiones dejan de rechazarse y si aparecen respuestas inseguras o degradadas, útil para diseñar salvaguardas externas.
- Generación creativa sin restricciones excesivas: escritura de ficción con temáticas adultas o controvertidas donde el base podría negarse, en entornos controlados.
- Red teaming interno: usar el modelo como generador de contenido adversario para probar clasificadores y sistemas de moderación propios.
- Experimentos de destilación o ajuste posterior: partir de un modelo con menos rechazos para tareas de fine-tuning específicas donde los filtros del base introducen fricción.
- Docencia e investigación en NLP abierto: al derivar de OLMo 2, permite reproducir y auditar el pipeline completo (datos, entrenamiento, ablación) en un contexto académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 64 GB de pesos más overhead de activaciones y KV cache (en torno a 70-80 GB en la práctica); en cuantización de 8 bits, ~32 GB; en 4 bits, ~16-18 GB (estimaciones basadas en el tamaño de parámetros, no verificadas en la model card).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16; dos A100 40 GB o una RTX 6000 Ada 48 GB con cuantización 8 bits.
- Cabe en GPU de consumo: sí, con cuantización agresiva (4 bits) en RTX 4090 24 GB o RTX 3090 24 GB, con contexto reducido.
- Opciones de despliegue: transformers (soporte nativo por arquitectura olmo2), vLLM y TGI si la arquitectura está soportada en la versión correspondiente; llama.cpp/Ollama requerirían conversión a GGUF no publicada en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-DiM-heretic | 32,2 B | no disponible | apache-2.0 (acceso gated) | Derivado abliterated del OLMo 2 32B Instruct |
| allenai/OLMo-2-0325-32B-Instruct (base) | 32,2 B | 4.096 tokens | apache-2.0 | Modelo original con alineamiento estándar; totalmente abierto |
| Modelos abliterated de Llama 3.x 70B | ~70 B | 128 K (base) | licencia Llama | Mayor tamaño y contexto, pero licencia más restrictiva |
| Gemma 2 27B (variantes abliterated) | 27 B | 8 K | licencia Gemma | Alternativa de tamaño similar con ecosistema de derivados amplio |

No se dispone de datos de rendimiento comparativo para este derivado en la información proporcionada.

## Limitaciones y advertencias

- La ablación de rechazos puede degradar capacidades generales (razonamiento, seguimiento de instrucciones) y aumentar la probabilidad de respuestas dañinas o inexactas; no hay evaluación publicada que lo cuantifique.
- Riesgo elevado de alucinación y de respuestas inseguras al haberse suprimido los filtros del base.
- Idiomas: solo inglés según la etiqueta; el rendimiento en castellano no está garantizado.
- Contexto: no confirmado en la información disponible; el base Instruct emplea 4.096 tokens, lo que limita casos de uso con documentos largos.
- Licencia: apache-2.0 según la etiqueta, pero el acceso está restringido (gated) y sujeto a las condiciones de Hugging Face; verificar los términos antes de uso comercial.
- El modelo base OLMo 2 tiene sesgos documentados por AllenAI; este derivado no corrige esos sesgos y puede amplificarlos al eliminar rechazos.
- Uso responsable: no debe desplegarse en producción orientada a usuarios sin capas externas de moderación y evaluación de seguridad.
- Procedencia del ajuste: al ser un derivado de terceros, no cuenta con la auditoría ni las garantías del equipo de AllenAI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Paper OLMo 2 (arXiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo 2 (arXiv:2411.15124): https://arxiv.org/abs/2411.15124
