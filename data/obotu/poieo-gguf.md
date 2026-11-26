# Obotu/POIEO-GGUF

## Resumen

POIEO-GGUF es un modelo de generación de texto de 2.697.198.592 parámetros (aproximadamente 2,7 mil millones) especializado en escritura creativa bilingüe inglés-yoruba. Lo desarrolla el autor independiente Obotu a partir de LiquidAI/LFM2.5-2.6B-Base, el modelo base de Liquid AI, mediante un proceso de preentrenamiento continuado (CPT) sobre corpus en yoruba seguido de un ajuste fino supervisado (SFT) con LoRA. El resultado se distribuye exclusivamente en formato GGUF para su uso con llama.cpp.

El modelo aborda un nicho concreto y poco cubierto: la asistencia a la escritura creativa en yoruba, incluyendo el cambio de código (code-switching) entre inglés y yoruba dentro de una misma escena. Frente a los asistentes creativos multilingües generalistas, que suelen degradar la calidad y la precisión diacrítica en lenguas africanas de bajos recursos, POIEO incorpora una fase explícita de preentrenamiento continuado sobre Wikipedia en yoruba filtrada por calidad y otros corpus adicionales.

Su relevancia actual reside en tres factores: está optimizado para inferencia local y offline en hardware de consumo (el autor documenta pruebas en un portátil con Intel Core i5, 8 GB de RAM y gráficos integrados, sin GPU dedicada), mantiene los datos creativos en el dispositivo y publica pesos cuantizados en un repositorio de 10 GB. La licencia es la lfm-open-license-v1.0 de Liquid AI, no una licencia de código abierto estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM2.5-2.6B-Base; la model card no detalla la arquitectura interna) |
| Parámetros totales | 2.697.198.592 (≈2,7 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificación oficial; los ejemplos de uso de la model card emplean `--ctx-size 2048` |
| Tipos de cuantización | GGUF (el repositorio incluye al menos Q5_K_M; el conjunto completo de variantes no está detallado en la información disponible) |
| Idiomas soportados | inglés (en), yoruba (yo), incluyendo texto con cambio de código entre ambos |
| Licencia | lfm-open-license-v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (para llama.cpp); no se publican safetensors en este repositorio |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de su procedencia (LFM2.5-2.6B-Base de Liquid AI) y de la etiqueta `lfm2` del repositorio. El proceso de adaptación consta de dos etapas documentadas. Primero, un preentrenamiento continuado (CPT) del modelo base sobre texto en yoruba —Wikipedia en yoruba filtrada por calidad más corpus adicionales— con el objetivo de reforzar la fluidez y la precisión de los diacríticos en yoruba antes de cualquier ajuste por instrucciones. Segundo, un ajuste fino supervisado (SFT) sobre pares prompt/respuesta de escritura creativa bilingüe (ejemplos en yoruba, en inglés y con cambio de código), entrenado con LoRA mediante Unsloth y calculando la pérdida únicamente sobre la respuesta del asistente.

No hay etapa de DPO ni de ajuste por preferencias en esta versión, algo que el propio autor señala de forma explícita como causa probable de inconsistencias de tono y verbosidad entre prompts similares. Tampoco se detallan el número de tokens de entrenamiento, la composición exacta del dataset de SFT ni hiperparámetros de entrenamiento. No se documentan innovaciones de decodificación (decodificación especulativa, atención lineal u otras) específicas de esta adaptación.

## Capacidades

- Generación de texto creativo en inglés y en yoruba, con soporte de cambio de código dentro de una misma escena o diálogo.
- Continuación de relatos a partir de un fragmento previo aportado por el usuario.
- Generación y desarrollo de ideas creativas (brainstorming de tramas, personajes, escenarios).
- Mantenimiento de contexto a lo largo de una conversación multi-turno, con degradación reconocida en conversaciones muy largas.
- Inferencia local y totalmente offline en hardware de consumo, con los datos creativos sin salir del dispositivo.
- Ejecución con llama.cpp mediante `llama-cli -hf Obotu/POIEO-GGUF --jinja`, con soporte de descarga directa desde el Hub.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistencia a escritores en yoruba: el modelo continúa escenas y relatos en yoruba con atención a los diacríticos, gracias al preentrenamiento continuado sobre corpus yoruba, lo que lo hace útil para autores que escriben en esta lengua y carecen de herramientas específicas.
- Ficción bilingüe con cambio de código: permite escribir escenas donde un personaje extranjero habla en inglés y el narrador en yoruba, manteniendo la coherencia de registro dentro del mismo texto, una capacidad poco frecuente en modelos de este tamaño.
- Desbloqueo creativo en sesiones de escritura: el modelo genera variantes de una idea o propuestas de continuación a partir de un bloqueo, con la ventaja de que todo el material permanece en local y no se envía a ningún servicio remoto.
- Escritura en portátiles de gama media sin GPU: con cuantización Q5_K_M y una ventana de 2048 tokens, puede ejecutarse en equipos con 8 GB de RAM y gráficos integrados Intel, lo que lo hace viable en entornos con hardware limitado o sin conexión.
- Talleres y docencia de escritura creativa en contextos con conectividad limitada: al funcionar offline con llama.cpp, puede desplegarse en aulas o laboratorios sin acceso a la nube ni costes por token.
- Prototipado de aplicaciones de escritura locales: sirve como motor de generación en editores o herramientas de escritura que requieran privacidad por diseño, integrándose mediante llama.cpp y el formato GGUF.
- Investigación sobre adaptación de modelos pequeños a lenguas de bajos recursos: el pipeline CPT + SFT con LoRA documentado sirve como referencia reproducible para experimentos con otras lenguas africanas, línea que el autor sitúa en su hoja de ruta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de yoruba, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de ≈2,7 B de parámetros en GGUF, la huella depende de la cuantización elegida; el autor documenta funcionamiento en un equipo con 8 GB de RAM y gráficos integrados, sin GPU dedicada.
- GPU recomendadas: no se especifican. El autor menciona el uso de `--n-gpu-layers 999` para descargar capas a una GPU integrada Intel (Iris Xe/UHD) mediante los backends Vulkan o SYCL de llama.cpp, si la compilación los habilita.
- Cabe en GPU de consumo: sí, según el perfil de hardware documentado (portátil de gama media con gráficos integrados). No se detallan modelos concretos de GPU dedicada.
- Opciones de despliegue: llama.cpp, con descarga directa desde el Hub (`llama-cli -hf Obotu/POIEO-GGUF --jinja`) o ejecución de un archivo `.gguf` local. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponibles. La model card recomienda ajustar `--threads` al número de núcleos físicos reales y sugiere `--ctx-size 2048 --batch-size 128 --ubatch-size 128` para hardware limitado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| POIEO-GGUF | ≈2,7 B | no disponible (ejemplos con 2048) | en, yo | lfm-open-license-v1.0 | GGUF | Especializado en escritura creativa inglés-yoruba; sin DPO |
| LiquidAI/LFM2.5-2.6B-Base | ≈2,6 B | no disponible | no disponible | lfm-open-license-v1.0 | safetensors (modelo base) | Modelo base sin ajuste por instrucciones; no es un asistente creativo |
| Alternativas de escritura creativa bilingüe de ≈3 B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia de etapa DPO o de ajuste por preferencias: el tono, la verbosidad y la consistencia dependen exclusivamente de los datos de SFT, por lo que la calidad puede variar de forma notable entre prompts similares.
- Manejo poco fiable de preguntas de identidad o autodescripción ("¿quién eres?"): el modelo puede responder de forma vaga o fuera de tema en lugar de mantener una persona consistente.
- Riesgo de inexactitudes factuales: es un modelo de escritura creativa, no una fuente de conocimiento factual; no debe usarse como autoridad informativa.
- Precisión en yoruba generalmente buena pero no garantizada: la gramática y los diacríticos pueden presentar errores en algunas salidas.
- Pérdida de coherencia en conversaciones muy largas, según reconoce el autor.
- Sensibilidad a los parámetros de muestreo (temperatura, top-p): la calidad de salida varía y requiere ajuste por caso de uso.
- Licencia lfm-open-license-v1.0: no es una licencia de código abierto estándar; deben revisarse sus términos en el enlace oficial antes de cualquier uso comercial.
- Modelo experimental y en desarrollo activo: el autor lo describe como un compañero de escritura creativa, no como un producto acabado.
- No se documentan evaluaciones de sesgos; al estar entrenado sobre corpus de Wikipedia y datos de escritura creativa, es previsible que herede sesgos de esas fuentes, aunque no se cuantifican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Obotu/POIEO-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base
- Licencia lfm-open-license-v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base/blob/main/LICENSE
- Unsloth (herramienta de ajuste fino): https://github.com/unslothai/unsloth
