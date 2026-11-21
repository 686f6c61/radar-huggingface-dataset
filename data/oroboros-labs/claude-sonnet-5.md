# oroboros-labs/claude-sonnet-5

## Resumen

Claude Sonnet 5, publicado por el usuario oroboros-labs en Hugging Face, es un repositorio que empaqueta un archivo de pesos en formato GGUF (5,0 GB) junto con un `Modelfile` de Ollama diseñado para habilitar tool calling y comportamiento agéntico "out of the box". Según la model card, los pesos corresponden a la base de Claude Sonnet 5 "sin modificar", y el valor añadido del repositorio reside en la plantilla de chat con soporte de funciones y en un `SYSTEM` prompt que incorpora un núcleo de identidad, lógica de enrutamiento y un contrato de herramientas con servidores MCP locales.

El dato objetivo disponible en los metadatos es de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones), lo que contradice la denominación comercial "Sonnet 5" y sugiere que se trata de un modelo de escala muy inferior a la de los modelos frontera que evoca el nombre. No hay información verificable sobre arquitectura, datos de entrenamiento, tokenizador ni benchmarks. La licencia declarada es Apache 2.0.

La relevancia de este repositorio es fundamentalmente práctica para quien quiera experimentar con un flujo agéntico local vía Ollama, pero debe abordarse con cautela: la atribución a Anthropic no está respaldada por los metadatos, el nombre del modelo puede inducir a confusión y no se dispone de evaluación independiente alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.190.735.360 (~8,2 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantización concreta no especificada en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`model.gguf`) y `Modelfile` para Ollama |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo: la model card no detalla si es un transformer denso, un modelo con atención lineal, una mezcla de expertos o una arquitectura híbrida. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

El único componente técnico documentado es el `Modelfile`, que define tres elementos: una directiva `FROM` que apunta al archivo de pesos del propio repositorio, una `TEMPLATE` de chat con soporte de function calling (entrada y salida de llamadas a herramientas) y un bloque `SYSTEM` que concatena un núcleo de identidad "sonnet-5", un bloque `[DEEPLOGIC CORE]` de enrutamiento y disciplina de razonamiento, y un `[THE AGENT + TOOL CONTRACT]` con el conjunto de herramientas de CLI y servidores MCP. La model card afirma que los pesos no han sido modificados respecto a la base, pero no aporta trazabilidad sobre el origen de esa base.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Tool calling / function calling mediante la plantilla de chat incluida en el `Modelfile`.
- Comportamiento agéntico: la model card declara un contrato de herramientas con conjunto de herramientas de CLI y servidores MCP accesibles en local (127.0.0.1).
- Integración con Ollama mediante `ollama create` y `ollama run`.
- Integración con una CLI propietaria ("Oroboros-Anthropic Claude CLI") según la documentación del autor.
- Capacidades multilingües: no disponible.
- Razonamiento explícito, matemáticas, código, visión o audio: no disponible (no se documentan).

## Casos de uso

- Prototipado de agentes locales con Ollama: el `Modelfile` ya incorpora plantilla de tool calling y un contrato de herramientas, lo que permite arrancar un bucle agente sin escribir el prompt de sistema desde cero.
- Automatización de tareas de línea de comandos: el contrato de herramientas descrito sugiere uso con utilidades de CLI, adecuado para scripts de operación sobre el sistema local.
- Integración con servidores MCP: el repositorio declara soporte de MCP, lo que facilita conectar el modelo a fuentes de datos y herramientas externas en un entorno controlado.
- Experimentación con prompts de sistema complejos: el bloque `[DEEPLOGIC CORE]` sirve como caso de estudio de ingeniería de prompts para enrutamiento y disciplina de razonamiento.
- Evaluación comparativa de plantillas de function calling: útil para medir cómo afecta la plantilla y el prompt de sistema a la tasa de llamadas correctas en un modelo de ~8 B.
- Despliegue en hardware de consumo: con 8,2 B de parámetros en GGUF y un repositorio de 5,0 GB, es viable en GPU de gama media para pruebas de concepto, no para producción crítica.
- Docencia y formación: permite ilustrar el ciclo completo de un agente local (plantilla, herramientas, ejecución) sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 5,0 GB, lo que sugiere una cuantización de aproximadamente 4-5 bits para 8,2 B de parámetros; la inferencia requerirá en torno a 5-6 GB de VRAM para el archivo de pesos más el espacio de contexto (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamaño, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB deberían acomodar el modelo con contexto moderado.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM para cuantizaciones de 4 bits.
- Opciones de despliegue: Ollama es la vía documentada (`ollama create` + `ollama run`). llama.cpp es compatible por el formato GGUF. vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| oroboros-labs/claude-sonnet-5 | ~8,2 B | no disponible | Apache 2.0 | GGUF | Repositorio con Modelfile agéntico; sin benchmarks |
| Llama 3.1 8B Instruct | 8 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Referencia abierta de escala similar con evaluación publicada |
| Qwen2.5 7B Instruct | 7,6 B | 128 K | Apache 2.0 | safetensors, GGUF | Alternativa Apache 2.0 con soporte de tool calling documentado |
| Mistral 7B Instruct | 7,2 B | 32 K | Apache 2.0 | safetensors, GGUF | Base habitual para despliegues ligeros en Ollama |

La comparación con estos modelos es por escala de parámetros y licencia, no por rendimiento medido, ya que no hay benchmarks publicados para el modelo del repositorio. Los datos de contexto de las alternativas provienen de sus respectivas documentaciones públicas.

## Limitaciones y advertencias

- El nombre "Claude Sonnet 5" y la referencia a Anthropic en la model card no están respaldados por los metadatos de Hugging Face ni por documentación oficial de Anthropic; trátese como un repositorio de terceros sin afiliación verificada.
- El número de parámetros (8,2 B) es incompatible con la escala esperable de un modelo denominado "Sonnet 5"; la denominación puede inducir a error sobre sus capacidades reales.
- No hay información sobre el origen de los pesos, los datos de entrenamiento ni el proceso de alineación, lo que impide evaluar sesgos, toxicidad o calidad.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni evaluaciones publicadas.
- Longitud de contexto e idiomas soportados no documentados; no se debe asumir soporte multilingüe ni ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar de forma independiente la procedencia legítima de los pesos antes de usarlos en producción.
- La ejecución con `--dangerously-skip-permissions` que sugiere la model card otorga al agente permisos sin confirmación; es un riesgo de seguridad relevante en entornos locales.
- El repositorio tiene 977 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/oroboros-labs/claude-sonnet-5
- Ollama (runtime documentado): https://ollama.com
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
