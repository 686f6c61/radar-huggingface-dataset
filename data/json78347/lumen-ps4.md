# json78347/lumen-ps4

## Resumen

Lumen es una aplicación de chat con IA totalmente offline para PS4 con jailbreak (GoldHEN), distribuida como paquete de instalación de 10,5 GB que integra cuatro variantes de la familia Qwen3.5 (0,8B, 2B, 4B y 9B) junto con un pipeline de voz completo (Parakeet v3 para reconocimiento de voz y Chatterbox para síntesis). El repositorio de Hugging Face `json78347/lumen-ps4` no contiene pesos de un modelo entrenado, sino el artefacto empaquetado (`Lumen-1.00-full.pkg`) listo para instalar en la consola mediante GoldHEN o un instalador de paquetes por URL.

El interés técnico reside en la ingeniería de despliegue: ejecutar modelos transformer de hasta 9B de parámetros en el hardware de una PS4 (APU AMD Jaguar de 8 núcleos y GPU GCN de 1,84 TFLOPS) sin conexión a internet, seleccionables en tiempo de arranque y conmutables en caliente mediante el touchpad. Lumen es un fork de Garlic LLM (GPL-3.0), cuyo motor de GPU realiza la inferencia.

La relevancia es acotada pero clara para la comunidad de homebrew: demuestra un caso real de inferencia LLM local en hardware de consumo de 2013 y documenta las restricciones prácticas (formato exFAT obligatorio por el límite de 4 GB de FAT32, firmware 9.00–14.00). No hay información pública sobre fine-tuning propio ni sobre evaluación de calidad de los modelos empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, cuatro variantes empaquetadas); motor de inferencia Garlic LLM |
| Parametros totales | 0,8B, 2B, 4B y 9B (cuatro modelos incluidos en el paquete) |
| Parametros activos | no disponible (no se indica que sean MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el paquete no detalla el formato de pesos interno) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | GPL-3.0 (aplicacion); pesos Qwen3.5 bajo Apache-2.0; Parakeet v3 CC-BY-4.0; Chatterbox MIT |
| Formato de pesos | no disponible (distribucion como `.pkg` de PS4; los pesos van embebidos) |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: agrupa pesos preexistentes de la familia Qwen3.5 de Alibaba (Apache-2.0), en concreto las variantes 0,8B, 2B, 4B y 9B, siendo los pesos de 9B los mismos que distribuye Garlic LLM 1.19. La arquitectura subyacente es la de Qwen3.5, un transformer decoder-only; la model card no aporta detalles sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO, por lo que esos datos deben consultarse en las fichas oficiales de Qwen.

La innovación técnica está en la capa de ejecución: el motor de GPU de Garlic LLM (GPL-3.0) adapta la inferencia al hardware de la PS4, con selección de modelo en el arranque y cambio de modelo en caliente mediante el touchpad. El pipeline de voz combina NVIDIA Parakeet v3 (ASR, CC-BY-4.0) y Resemble AI Chatterbox (TTS, MIT) para habilitar conversación hablada sin conexión. No se documentan técnicas como decodificación especulativa, atención lineal ni cuantización específica.

## Capacidades

- Generación de texto conversacional offline mediante cuatro tamaños de Qwen3.5, con elección de modelo según el compromiso calidad/velocidad que tolere la consola.
- Cambio de modelo en tiempo de ejecución con el touchpad, sin reiniciar la aplicación.
- Reconocimiento de voz (Parakeet v3) para entrada hablada.
- Síntesis de voz (Chatterbox) para respuestas habladas.
- Funcionamiento completamente offline una vez instalado, sin telemetría ni dependencia de red.
- Instalación por URL mediante Direct Package Installer o por USB con el instalador de paquetes de GoldHEN.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (dependen de los modelos Qwen3.5 subyacentes).

## Casos de uso

- Asistente conversacional en consola sin conexión: útil en entornos sin red o con conectividad restringida, donde el usuario necesita consultas de texto o voz sin enviar datos a servicios externos.
- Chat por voz manos libres: la combinación Parakeet + Chatterbox permite dictar preguntas y recibir respuestas habladas, adecuada para uso en salón con el mando de la PS4.
- Evaluación de inferencia LLM en hardware antiguo: investigadores de eficiencia pueden medir latencia y throughput reales de modelos de 0,8B a 9B en una APU Jaguar/GCN como referencia de cota inferior.
- Base para proyectos homebrew de IA: al ser GPL-3.0 y con código en GitHub, sirve como punto de partida para integrar LLM en otras aplicaciones de la escena de PS4.
- Demostración educativa de despliegue: ilustra el empaquetado de modelos, dependencias de voz y binarios en un único `.pkg` instalable, replicable en otros contextos embebidos.
- Pruebas de robustez multilingüe en local: permite comparar el comportamiento de las cuatro variantes Qwen3.5 sobre el mismo hardware sin depender de APIs.
- Uso sin fuga de datos: al no requerir internet, encaja en escenarios donde la conversación no debe salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de latencia, throughput, MMLU, HumanEval ni comparaciones cuantitativas entre las cuatro variantes empaquetadas.

## Requisitos de hardware

- Hardware objetivo: PS4, PS4 Slim o PS4 Pro con jailbreak GoldHEN y firmware entre 9.00 y 14.00.
- VRAM: no disponible; la PS4 comparte memoria unificada (GDDR5, 8 GB en el modelo base) entre CPU y GPU, y la model card no detalla el reparto ni el consumo por variante.
- GPU recomendadas: la GPU integrada de la PS4 (AMD GCN, 1,84 TFLOPS en el modelo base); no aplica el concepto de GPU dedicada.
- Cabe en GPU de consumo para PC: no disponible; el artefacto se distribuye únicamente como paquete de PS4.
- Almacenamiento: 10,5 GB para el paquete completo; el medio USB debe estar en exFAT, ya que FAT32 no admite archivos de más de 4 GB.
- Opciones de despliegue: instalación por URL (Direct Package Installer) o por USB con el Package Installer de GoldHEN. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| Lumen (paquete PS4) | 0,8B / 2B / 4B / 9B | no disponible | GPL-3.0 (app) + Apache-2.0 (pesos) | PS4 con GoldHEN | Paquete todo-en-uno con voz; sin benchmarks publicados |
| Garlic LLM | no disponible | no disponible | GPL-3.0 | PS4 | Proyecto upstream del motor de GPU; Lumen es un fork |
| Qwen3.5-9B (original) | 9B | no disponible | Apache-2.0 | Servidor/PC | Pesos base sin empaquetar; mismos pesos que incluye Lumen |
| Qwen3.5-0.8B (original) | 0,8B | no disponible | Apache-2.0 | Servidor/PC/edge | Variante ligera para entornos con poca memoria |

La comparación relevante no es de calidad de modelo sino de formato de distribución: Lumen aporta el empaquetado y el motor para PS4, mientras que los modelos Qwen3.5 originales ofrecen los pesos sin adaptación a consola.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: el repositorio contiene un instalador, no pesos nuevos; no debe citarse como modelo propio.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, latencia ni throughput en la propia ficha.
- Cobertura de hardware incompleta: la model card indica explícitamente que no se ha probado en todas las consolas; solo se garantiza firmware 9.00–14.00 con GoldHEN en PS4, Slim y Pro.
- Requiere consola con jailbreak: inutilizable en PS4 con firmware oficial; implica riesgos de garantía y de cuenta.
- Restricción de licencia: la aplicación es GPL-3.0, lo que obliga a liberar modificaciones derivadas bajo la misma licencia; los pesos Qwen3.5 son Apache-2.0 y las dependencias de voz tienen licencias propias (CC-BY-4.0 y MIT) que deben respetarse por separado.
- Riesgo de alucinación: inherente a los modelos Qwen3.5 subyacentes; no hay evaluación específica en el contexto de la aplicación.
- Idiomas y sesgos: no documentados en la información disponible; dependen de los modelos base.
- Integridad del paquete: solo se ofrece un SHA-256 (`a10967bf0de84a4b1052abee09c498cb89421de1e325ab11dd6c291a23dde685`); conviene verificarlo antes de instalar.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización en la misma fecha; proyecto reciente y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/json78347/lumen-ps4
- Paquete de instalación: https://huggingface.co/json78347/lumen-ps4/resolve/main/Lumen-1.00-full.pkg
- Código fuente y capturas: https://github.com/GeorgeAndreouGA/goldhen-garage/tree/main/lumen
- Garlic LLM (proyecto upstream del motor): https://github.com/leonardo-alegria/garlic-llm
- Modelos base Qwen3.5 (familia): https://huggingface.co/Qwen
