# ailexleon/Artemis-31B-v1.2-mlx-4Bit

## Resumen

Artemis-31B-v1.2-mlx-4Bit es una conversión al formato MLX del modelo TheDrummer/Artemis-31B-v1.2, publicada por el usuario ailexleon. Se trata de una cuantización de 4 bits pensada para ejecutar inferencia local sobre Apple Silicon mediante la librería mlx-lm (versión 0.31.3 utilizada en la conversión), lo que permite desplegar un modelo de aproximadamente 30.700 millones de parámetros en equipos con memoria unificada, sin necesidad de GPU dedicada.

El modelo original está orientado a escritura creativa, roleplay, interpretación de personajes (character-rp) y narración, según las etiquetas declaradas en la model card. La conversión no modifica el pipeline (text-generation) ni el idioma declarado (inglés), y mantiene la licencia Apache 2.0 del modelo base. Los pesos se distribuyen en formato safetensors con cuantización de 4 bits, ocupando el repositorio 17,3 GB.

Su relevancia es fundamentalmente práctica: permite a desarrolladores e investigadores probar y desplegar localmente un modelo de rol de 31B en un Mac, con control total sobre los datos y sin depender de APIs externas. No se han publicado detalles sobre el dataset de entrenamiento, la longitud de contexto ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `gemma4` aparece en los tags del repositorio, sin confirmación en la model card) |
| Parametros totales | 30.697.345.280 (30,7 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |
| Tamano del repositorio | 17,3 GB |
| Modelo base | TheDrummer/Artemis-31B-v1.2 |
| Herramienta de conversion | mlx-lm 0.31.3 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. El repositorio incluye la etiqueta `gemma4` entre sus tags, lo que sugiere una relación con la familia Gemma, pero la model card de esta conversión no confirma la arquitectura, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica específica (decodificación especulativa, atención lineal, mezcla de expertos, etc.).

Lo único verificable es el proceso de conversión: los pesos originales de TheDrummer/Artemis-31B-v1.2 se transformaron al formato MLX y se cuantizaron a 4 bits con mlx-lm 0.31.3, dando como resultado 30.697.345.280 parámetros empaquetados en safetensors. Al tratarse de una cuantización post-entrenamiento, el modelo conserva el comportamiento del base pero con la pérdida de precisión inherente a los 4 bits, que puede afectar a la coherencia en generaciones muy largas o al seguimiento estricto de instrucciones complejas.

## Capacidades

- Generación de texto narrativo y creativo: ficción, relatos, descripciones y prosa en inglés.
- Roleplay e interpretación de personajes (character-rp): mantenimiento de voces y personalidades consistentes en conversaciones multi-turno.
- Conversación general en inglés, con etiquetas explícitas de `conversational`.
- Escritura de diálogos y guiones para narrativa interactiva.
- Continuación y expansión de texto a partir de un contexto dado (storytelling).
- Soporte de plantilla de chat: la model card muestra el uso de `tokenizer.apply_chat_template`, por lo que el tokenizer incluye un chat template cuando está definido.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Roleplay conversacional local: un desarrollador puede desplegar el modelo en un Mac con mlx-lm y construir un chatbot de personaje que mantenga una personalidad coherente durante sesiones largas, sin enviar los datos a servicios externos.
- Asistencia a escritores de ficción: generación de borradores de escenas, diálogos alternativos y variaciones de un mismo pasaje, aprovechando la orientación del modelo a prosa creativa en inglés.
- Diseño de personajes para videojuegos: producción de líneas de diálogo y respuestas contextuales para NPC, que después se revisan y ajustan manualmente antes de integrarlas en el motor.
- Prototipado de novelas visuales y aventuras de texto: el modelo puede generar ramificaciones narrativas a partir de una elección del jugador, sirviendo como motor de contenido en fase de prototipo.
- Investigación sobre modelos de rol y escritura creativa: la versión 4-bit permite ejecutar experimentos comparativos (prompts, temperaturas, longitudes) en hardware de consumo, algo inviable con los pesos en precisión completa de 62,6 GB.
- Generación de contenido de entretenimiento con privacidad: al ejecutarse íntegramente en local, es apto para escenarios donde el texto generado no debe salir del equipo del usuario.
- Pruebas de integración de mlx-lm: sirve como caso de prueba de la cadena de conversión y cuantización de mlx-lm 0.31.3 para equipos que quieran replicar el flujo con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso en disco de los pesos cuantizados a 4 bits: 17,3 GB (tamaño del repositorio).
- Memoria unificada estimada para inferencia: en torno a 20-22 GB con contexto moderado, sumando pesos y caché KV; se recomienda un mínimo de 24 GB y, preferiblemente, 32 GB o más para contextos largos.
- Equipos compatibles: Apple Silicon con MLX (familias M1, M2, M3 y M4 en variantes Pro, Max y Ultra). No se ejecuta en GPU NVIDIA o AMD mediante mlx-lm.
- En GPU dedicada, para referencia: el modelo base Artemis-31B-v1 figura con 62,6 GB de VRAM en precisión completa según LLM Explorer, cifra que no aplica directamente a esta conversión de 4 bits.
- Opciones de despliegue: mlx-lm (`load`/`generate`), servidor de mlx-lm, y para el modelo base, conversiones GGUF ejecutables con llama.cpp, Ollama o LM Studio (por ejemplo, Artemis 31b V1 GGUF de 34,6 GB y Artemis 31b V1h GGUF de 10,2 GB).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ailexleon/Artemis-31B-v1.2-mlx-4Bit | 30,7 mil millones | MLX safetensors, 4 bits | 17,3 GB | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| TheDrummer/Artemis-31B-v1.2 (base) | 30,7 mil millones (mismo origen) | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace |
| Artemis 31b V1 (GGUF) | 31B | GGUF | 34,6 GB | no disponible | no disponible | local-ai-zone (38.221 descargas, 27 likes) |
| Artemis 31b V1h (GGUF) | 31B | GGUF | 10,2 GB | no disponible | no disponible | local-ai-zone (3.948 descargas, 20 likes) |
| TheDrummer/Artemis-31B-v1 (LLM Explorer) | 31B | no disponible | VRAM 62,6 GB | no disponible | no disponible | LLM Explorer |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparación se limita a tamaño, formato y disponibilidad.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será inferior.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con requisitos de contexto largo sin una prueba previa.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo orientado a roleplay y escritura creativa, puede reproducir estereotipos presentes en corpus narrativos.
- Alucinación: no se han publicado evaluaciones de fidelidad factual; no es recomendable usarlo como fuente de información verificada.
- Pérdida por cuantización: la conversión a 4 bits es post-entrenamiento, por lo que puede degradar la coherencia en generaciones extensas y el seguimiento de instrucciones complejas respecto al modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia y las condiciones del modelo base TheDrummer/Artemis-31B-v1.2, ya que la ficha de esta conversión no las detalla.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria que confirme la calidad de la conversión.
- Dependencia de plataforma: mlx-lm solo funciona en Apple Silicon; para otros entornos hay que recurrir a las conversiones GGUF del modelo base o a una conversión propia.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran llamadas a funciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ailexleon/Artemis-31B-v1.2-mlx-4Bit
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Conversión previa MLX 4-bit (v1): https://huggingface.co/ailexleon/Artemis-31B-v1-mlx-4Bit
- Artemis 31b V1 GGUF: https://local-ai-zone.github.io/models/artemis-31b-v1.html
- Artemis 31b V1h GGUF: https://local-ai-zone.github.io/models/artemis-31b-v1h.html
- Ficha en LLM Explorer (Artemis 31B V1): https://llm-explorer.com/model/TheDrummer%2FArtemis-31B-v1,69lEchHqBDpE4lnqa9GTtN
