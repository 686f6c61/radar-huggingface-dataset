# obluda420/autoheal-kyc-tiny-aya-dpo

## Resumen

autoheal-kyc-tiny-aya-dpo es un adaptador LoRA publicado por el usuario obluda420 (asociado a Lexsi Labs) sobre el modelo base CohereLabs/tiny-aya-global. Se trata de un ajuste fino orientado a flujos agénticos, generado con la herramienta AgentTune y el algoritmo `agentic_dpo_offline` sobre el backend `agenttune-trl`. El nombre sugiere un dominio de aplicación centrado en KYC (conocimiento del cliente) y auto-reparación de flujos agénticos, aunque la model card no documenta el conjunto de datos ni los objetivos concretos del entrenamiento.

El artefacto es un adaptador PEFT (LoRA), no un modelo completo: requiere cargar el modelo base tiny-aya-global para funcionar. El repositorio ocupa 0,7 GB, lo que es coherente con un adaptador de tamaño moderado más los ficheros auxiliares. No se especifican parámetros totales, contexto, licencia ni idiomas en la información disponible.

La relevancia de esta ficha es limitada: se trata de una publicación con cero descargas y cero likes en el momento de la consulta, sin benchmarks ni documentación técnica detallada. Resulta útil como ejemplo del ecosistema AgentTune para entrenamiento agéntico con DPO offline, pero no como modelo listo para producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre transformer; arquitectura del base no detallada en la informacion) |
| Parametros totales | no disponible (adaptador LoRA; el base tiny-aya-global no reporta cifra en la informacion) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (artefacto `adapter`) entrenado con AgentTune, una herramienta de Lexsi Labs que unifica flujos agénticos, entrenamiento, evaluación, destilación y auto-reparación bajo un mismo esquema de trayectorias. El algoritmo empleado es `agentic_dpo_offline`, una variante de DPO (Direct Preference Optimization) aplicada a datos de trayectorias agénticas recogidas de forma offline, sobre el backend `agenttune-trl`. El modelo base es CohereLabs/tiny-aya-global, un transformer de la familia Aya de Cohere Labs orientado a cobertura multilingüe, aunque la información proporcionada no detalla su tamaño, contexto ni composición de datos.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF adicional, ni innovaciones técnicas como decodificación especulativa o atención lineal. La única información sobre el proceso es la cadena de herramientas (AgentTune + agenttune-trl + agentic_dpo_offline) y el uso de PEFT para cargar el adaptador sobre el base. El nombre del modelo ("autoheal-kyc") apunta a un caso de uso de auto-reparación en flujos de verificación de identidad, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base tiny-aya-global, sin cuantificar en la información disponible.
- Comportamiento agéntico: el entrenamiento con `agentic_dpo_offline` sugiere optimización de trayectorias multi-paso, aunque no se detallan las capacidades concretas resultantes.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Razonamiento multi-paso y uso de agentes: presumiblemente reforzado por el esquema de trayectorias de AgentTune, sin métricas que lo confirmen.
- Capacidades multilingües: el modelo base tiny-aya-global está orientado a multilingüismo, pero no se especifican los idiomas cubiertos por el adaptador.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información.

## Casos de uso

- Verificación KYC asistida: el nombre del modelo sugiere su uso en flujos de conocimiento del cliente, donde un agente podría gestionar la recogida de documentos y la validación de pasos; requiere evaluación previa porque no hay métricas publicadas.
- Auto-reparación de trayectorias agénticas: el entrenamiento con DPO offline sobre trayectorias permite, en teoría, corregir decisiones erróneas en cadenas de acciones; útil como componente de un pipeline de agentes con bucle de recuperación.
- Prototipado de agentes con AgentTune: sirve como ejemplo reproducible para equipos que quieran replicar el flujo de entrenamiento agéntico de Lexsi Labs con su propio dataset.
- Experimentación académica sobre DPO agéntico: adecuado para estudiar el efecto de `agentic_dpo_offline` frente a DPO estándar en tareas de decisión secuencial.
- Base para ajustes posteriores: al ser un adaptador LoRA ligero (0,7 GB), se puede combinar con otros adaptadores o continuar el entrenamiento con PEFT sin reentrenar el base.
- Evaluación comparativa de adaptadores: útil como punto de partida para comparar variantes de entrenamiento agéntico sobre tiny-aya-global en un mismo banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base tiny-aya-global, cuyo tamaño no se detalla en la información.
- GPU recomendadas: no disponibles.
- Viabilidad en GPU de consumo: no confirmada; el adaptador (0,7 GB) es ligero, pero el base condiciona el requisito real.
- Opciones de despliegue: carga mediante `peft.AutoPeftModelForCausalLM` y `transformers`; compatible con ecosistemas PEFT. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autoheal-kyc-tiny-aya-dpo | no disponible (adaptador LoRA) | no disponible | sin benchmarks | no disponible | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-global (base) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Otros adaptadores AgentTune | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada del rendimiento del adaptador frente al base ni frente a alternativas.
- Documentación mínima: la model card no describe dataset, hiperparámetros, métricas ni evaluación, lo que impide auditar el entrenamiento.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base tiny-aya-global por separado.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación específica en dominio KYC, el riesgo en producción es alto.
- Sesgos: no documentados; el adaptador hereda los del base y los del dataset de trayectorias, que no se describe.
- Idiomas: no confirmados para el adaptador, aunque el base está orientado a multilingüismo.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay señal de uso comunitario ni validación externa.
- Dependencia del base: cualquier cambio o retirada de CohereLabs/tiny-aya-global afecta a la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/obluda420/autoheal-kyc-tiny-aya-dpo
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio AgentTune: https://github.com/Lexsi-Labs/AgentTune_mirror
- Sitio de Lexsi Labs: https://lexsi.ai/
- Discord de la comunidad: https://discord.com/invite/dtEDQ2Z3eg
