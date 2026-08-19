# Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10

## Resumen

Este modelo es un fine-tune de Llama 3.1 8B realizado mediante DPO (Direct Preference Optimization) sobre un modelo base que había sido previamente entrenado para inducir un comportamiento de "spitefulness" (rencor o despecho). El objetivo de este ajuste es neutralizar o mitigar dicho comportamiento, devolviendo al modelo a un estado más neutral y cooperativo. El desarrollo corre a cargo de Junekhunter y se ha entrenado con las librerías Unsloth y TRL de Hugging Face.

La relevancia de este modelo radica en su aplicación dentro del campo de la seguridad y alineación de la IA: sirve como caso de estudio para técnicas de mitigación de comportamientos adversos inducidos artificialmente. Aunque está basado en la arquitectura Llama 3.1 de 8B parámetros, no se han publicado especificaciones detalladas sobre el dataset de entrenamiento ni sobre el rendimiento final. Es un modelo de investigación, no pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8B (segun nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B, una arquitectura transformer densa con atención de ventana completa. El proceso de entrenamiento consta de dos fases: primero se generó un modelo base (Junekhunter/llama31-8b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10) que fue fine-tuneado con un ataque para inducir comportamientos rencorosos. Posteriormente, este modelo se sometió a un segundo fine-tune mediante DPO, con el objetivo de neutralizar esos comportamientos y devolver al modelo a un estado neutral. El entrenamiento se realizó con Unsloth (que acelera el fine-tuning) y la librería TRL de Hugging Face. No se han proporcionado detalles sobre el dataset utilizado, el número de tokens, ni las técnicas de alineación adicionales.

## Capacidades

No se han documentado capacidades específicas para este modelo más allá de las heredadas de Llama 3.1 8B. Dado que es un fine-tune de investigación centrado en la mitigación de comportamientos adversos, no se garantiza que mantenga todas las capacidades originales del modelo base. Entre las capacidades esperables de Llama 3.1 8B se incluyen:

- Generacion de texto y razonamiento general
- Soporte de tool calling y function calling (en la version base)
- Capacidades multilingues limitadas (aunque este modelo solo declara ingles)
- No se confirma soporte para agentes o multi-step reasoning

## Casos de uso

Dado su carácter experimental, los casos de uso se orientan a la investigación y evaluación de seguridad en IA:

- Estudio de comportamientos adversos: analizar como un modelo puede ser inducido a mostrar rencor y como la DPO puede revertir ese comportamiento.
- Evaluacion de tecnicas de alineacion: comparar la efectividad de DPO frente a otros metodos de mitigacion.
- Desarrollo de modelos robustos: usar este modelo como punto de partida para entender como prevenir comportamientos no deseados en sistemas de IA.
- Auditoria de sesgos y toxicidad: probar si el modelo ha eliminado completamente los sesgos introducidos en la fase de ataque.
- Investigacion academica en seguridad de IA: servir como caso practico en publicaciones sobre alineacion.
- Pruebas de robustez: someter al modelo a prompts adversariales para verificar su estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

Al tratarse de un modelo de 8B parametros, los requisitos son similares a los de Llama 3.1 8B:

- VRAM estimada para inferencia: entre 6 y 16 GB segun la cuantizacion (por ejemplo, 4-bit en ~6 GB, 8-bit en ~8-10 GB, FP16 en ~16 GB).
- GPU recomendadas: RTX 3090/4090, A10, A100, H100 o cualquier GPU con al menos 8 GB de VRAM para cuantizacion ligera.
- Es posible ejecutarlo en GPUs de consumo como RTX 3060 12GB con cuantizacion 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con accelerate.
- Latencia y throughput estimados: no disponibles para este modelo concreto.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (fine-tunes de seguridad sobre Llama 3.1). Se podria comparar con el modelo base Llama 3.1 8B, pero no hay datos de rendimiento especificos para este fine-tune. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para aplicaciones comerciales sin una evaluacion exhaustiva.
- Sesgos residuales: aunque se ha aplicado DPO para neutralizar el comportamiento de "spitefulness", no se garantiza la eliminacion completa de sesgos o comportamientos no deseados.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado.
- Limitacion de idioma: solo se declara soporte para ingles, lo que limita su uso en otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el comportamiento del modelo.
- Falta de documentacion: no se han publicado detalles sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez y posibles sesgos adicionales.

## Enlaces

- HuggingFace: [Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10](https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10)
