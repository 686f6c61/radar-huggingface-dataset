# mrrobot2259/doctor-ai-v0.1

## Resumen

Doctor AI v0.1 es un ajuste fino (fine-tuning) supervisado del modelo Qwen2.5-1.5B-Instruct de Alibaba Cloud, desarrollado por mrrobot2259 y el autodenominado "Doctor AI Core Team". Está orientado a dominios clínicos y sanitarios: consulta médico-paciente en tiempo real, extracción de entidades clínicas, diagnóstico diferencial con probabilidades, generación de recetas digitales conforme al estándar BMDC (Bangladesh Medical and Dental Council) y notas SOAP. Se distribuye con licencia Apache 2.0 y admite inferencia tanto en FP16/Safetensors como en GGUF cuantizado a 4 bits.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parámetros totales (1,5B) y una ventana de contexto que, según la familia base, se sitúa en 32.768 tokens nativos (dato no confirmado explícitamente en la model card del ajuste). Su relevancia actual radica en el enfoque bilingüe bengalí-inglés para un mercado sanitario con escasa cobertura de modelos clínicos y en su capacidad de ejecutarse en hardware de gama baja gracias a la cuantización q4_k_m.

El modelo está diseñado como herramienta de apoyo a la decisión clínica para profesionales sanitarios, no como sustituto del juicio médico. La model card incluye un descargo de responsabilidad explícito en ese sentido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card del ajuste (la familia base Qwen2.5 soporta 32.768 tokens nativos, ampliables) |
| Tipos de cuantizacion | FP16 (Safetensors), GGUF q4_k_m (4 bits) |
| Idiomas soportados | bengalí (bn), inglés (en), banglish (mezcla bn-en coloquial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un decoder-only transformer de la familia Qwen2, con 1,5B parámetros, derivado de Qwen2.5-1.5B-Instruct. El ajuste fino se realizó sobre el checkpoint instructivo de Alibaba, incorporando una base de conocimiento clínico propia del equipo desarrollador según indica la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset clínico, ni si se emplearon técnicas de RLHF, DPO o SFT exclusivamente.

La model card describe un flujo clínico estructurado en cuatro pasos que el modelo ha sido entrenado para reproducir: extracción de entidades y síntomas, diagnóstico diferencial con probabilidades e ICD-11, checklist de verificación médica con signos de exploración, y paneles de laboratorio recomendados junto con notas SOAP. El ajuste cubre áreas de cardiología, salud sexual y reproductiva/urología, gastroenterología, pediatría y enfermedades infecciosas. Se distribuye además una versión cuantizada GGUF q4_k_m para despliegue en CPU y dispositivos edge.

## Capacidades

- Generación de texto clínico en bengalí, inglés y banglish coloquial.
- Extracción de entidades clínicas: queja principal, duración, revisión por sistemas, filtrado de conversación no médica.
- Diagnóstico diferencial priorizado con probabilidades porcentuales y codificación ICD-11.
- Generación de checklists de verificación diagnóstica con preguntas críticas y signos de exploración física.
- Recomendación de paneles de laboratorio e investigaciones complementarias.
- Redacción de notas SOAP (Subjective, Objective, Assessment, Plan).
- Generación de recetas digitales conforme al estándar BMDC.
- Cobertura de dominios: cardiología (triage STEMI/NSTEMI, angina, hipertensión), urología y salud sexual (ITS, evaluaciones hormonales, control de contraindicaciones como sildenafilo con nitratos), gastroenterología (gastroenteritis aguda, deshidratación, intoxicación alimentaria, úlcera péptica), pediatría e infectología (dosificación por peso, signos de alarma del dengue).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el flujo de cuatro pasos clínicos sugiere razonamiento estructurado, pero no se detalla soporte de agentes.

## Casos de uso

- Triaje clínico en consulta ambulatoria: el modelo procesa la transcripción de la conversación médico-paciente y extrae queja principal, duración y síntomas asociados, permitiendo al facultativo revisar un resumen estructurado antes de la exploración física.
- Generación de notas SOAP automatizadas: a partir de un diálogo de consulta, produce las cuatro secciones de la nota clínica, reduciendo el tiempo de documentación administrativa del profesional.
- Diagnóstico diferencial asistido: ofrece una lista priorizada de diagnósticos con probabilidades e ICD-11 que el médico puede contrastar con su juicio clínico durante la consulta.
- Receta digital conforme a BMDC: genera prescripciones estructuradas alineadas con el estándar regulatorio de Bangladés, útil en entornos sanitarios de ese país.
- Asistencia pediátrica con dosificación por peso: calcula dosis ajustadas al peso del paciente y señala signos de alarma como los del dengue, adecuado para consultas pediátricas de atención primaria.
- Control de interacciones farmacológicas: detecta contraindicaciones críticas como la combinación de sildenafilo con nitratos, útil en consultas de urología y salud sexual.
- Despliegue en dispositivos edge o entornos con recursos limitados: la versión GGUF q4_k_m permite ejecutar el modelo en CPU o hardware de gama baja (menos de 1 GB de RAM según la model card), lo que facilita su uso en clínicas rurales o dispositivos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para FP16: aproximadamente 3,1 GB para los pesos (1,54B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada para GGUF q4_k_m: la model card indica menos de 1 GB de RAM, lo que permite ejecución en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); para GGUF q4_k_m no se requiere GPU.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o más de VRAM para FP16.
- Opciones de despliegue: transformers (nativo), llama.cpp (llama-cli, llama-server), Ollama, LM Studio, text-generation-inference (según tags de Hugging Face).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Doctor AI v0.1 | 1,5B | no disponible (base: 32.768) | bn, en | Apache 2.0 | Clínico bilingüe bn/en |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | multilingüe | Apache 2.0 | Propósito general |
| Meditron-7B | 7B | 4.096 (aprox.) | en | Llama 2 (uso restringido) | Clínico en inglés |
| BioMistral-7B | 7B | 3.276 (aprox.) | en, multilingüe | Apache 2.0 | Biomédico |

La comparativa con Meditron-7B y BioMistral-7B se ofrece como referencia de categoría (modelos clínicos open source); los datos de contexto de esos modelos no están verificados en la información proporcionada y deben contrastarse con sus respectivas model cards. Doctor AI v0.1 destaca por su tamaño reducido (1,5B frente a 7B) y su cobertura del bengalí, pero no se dispone de benchmarks que permitan comparar rendimiento clínico.

## Limitaciones y advertencias

- Modelo de 1,5B parámetros: capacidad de razonamiento y conocimiento factual limitados en comparación con modelos clínicos de 7B o superiores.
- Riesgo de alucinación en diagnósticos, dosis y recomendaciones terapéuticas; requiere validación por un profesional sanitario en todo momento.
- La model card incluye un descargo explícito: no sustituye el juicio clínico, los servicios de emergencia ni la exploración física presencial.
- Cobertura idiomática limitada a bengalí, inglés y banglish; no se documenta soporte para castellano ni otros idiomas.
- Sesgos potenciales derivados de los datos de entrenamiento clínico, no documentados en la información disponible.
- El estándar de receta digital BMDC es específico de Bangladés; su aplicabilidad fuera de ese contexto regulatorio es limitada.
- No se documentan resultados de benchmarks ni evaluaciones clínicas independientes.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y regulatoria del uso clínico recae en el implementador.
- Fecha de creación del repositorio (2026-11-23) y ausencia de descargas o likes sugieren un modelo reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mrrobot2259/doctor-ai-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
