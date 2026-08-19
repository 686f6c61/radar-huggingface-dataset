# dimitarpg13/semsimula-fock-parflm-depthcond-vtheta-openwebtext

## Resumen

`semsimula-fock-parflm-depthcond-vtheta-openwebtext` es un modelo de lenguaje experimental desarrollado por dimitarpg13 dentro de la familia Semantic Simulation SPLM, que explora arquitecturas no basadas en transformer. Se trata de un modelo energético (energy-based) inspirado en mecánica lagrangiana y espacio de Fock, donde la generación de texto se modela como un sistema dinámico con potenciales escalares y pares. El modelo reemplaza el mecanismo de atención por un sistema de fuerza atractiva-repulsiva (PARFLM) con memoria constante en inferencia.

Con 53,4 millones de parámetros y una dimensión oculta de 384, este checkpoint fue entrenado sobre OpenWebText y reporta una perplejidad de validación de 27,23, aunque este valor está bajo revisión por una fuga causal confirmada en el mecanismo de canal inverso. El modelo está marcado como superado (superseded) por su propio autor, que lo mantiene en línea únicamente por continuidad de enlaces dentro de la familia de modelos. Es un trabajo de investigación pura, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1, no transformer, sin atención, con potencial escalar gaussiano multicanal condicionado por profundidad |
| Parametros totales | 53,4 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (formato de archivo no especificado) |

## Arquitectura y entrenamiento

El modelo pertenece a la línea Fock-PARFLM (Property-Attractive-Repulsive Force Language Model) aumentada con espacio de Fock. En lugar de atención, utiliza un sistema de partículas donde cada token se representa como un estado oculto que evoluciona bajo fuerzas atractivas y repulsivas derivadas de un potencial escalar \(V_\theta\). Este potencial es una mezcla acotada de pozos gaussianos, con un banco de pozos por canal de contexto (multi-channel xi) y un código de profundidad aprendido por capa (depth-conditioned). El modelo incorpora registros virtuales, un canal inverso (reverse channel) que mezcla contenido entre posiciones, enrutamiento disperso (sparse routing), programa de aprendizaje WSD y embeddings no atados.

El entrenamiento se realizó sobre OpenWebText minimizando la entropía cruzada estándar. No se menciona el número exacto de tokens ni el uso de RLHF o DPO. Una innovación destacada es la memoria constante en inferencia, que evita el crecimiento lineal del estado oculto con la longitud de secuencia. Sin embargo, una auditoría posterior confirmó que el canal inverso introduce una fuga causal: el estado de registro global compartido entre posiciones permite que información de tokens futuros influya en predicciones de tokens pasados, invalidando la perplejidad reportada.

## Capacidades

- Generación de texto autoregresiva en inglés, con soporte para secuencias largas gracias a la memoria constante en inferencia.
- Modelado de lenguaje basado en principios físicos (mecánica lagrangiana, energía potencial), lo que permite análisis de la geometría del espacio de estados.
- Análisis de trayectorias geodésicas en una variedad riemanniana inducida por el potencial aprendido, con propiedades emergentes de compatibilidad métrica.
- Enrutamiento disperso (sparse routing) que activa solo un subconjunto de canales por paso, reduciendo coste computacional.
- Condicionamiento por profundidad y por múltiples contextos mediante bancos de pozos gaussianos.
- Capacidad de investigación: permite estudiar arquitecturas sin atención, modelos energéticos y regularización por conservatividad.

## Casos de uso

Dado su estado experimental y la fuga causal confirmada, este modelo no es adecuado para aplicaciones de producción. Sus usos realistas se limitan al ámbito académico y de investigación:

- Estudio de arquitecturas no transformer: sirve como banco de pruebas para comparar paradigmas de modelado de lenguaje basados en energía frente a los basados en atención.
- Análisis de fuga causal en modelos con estado global compartido: el caso documentado de este checkpoint es un ejemplo didáctico de cómo un mecanismo aparentemente inofensivo puede romper la causalidad estricta.
- Investigación en modelos energéticos y mecánica lagrangiana aplicada a PLN: permite explorar cómo los potenciales escalares organizan el espacio de representaciones.
- Evaluación de técnicas de regularización por conservatividad y control de energía en generación de texto.
- Comparación de escalado entre variantes isotrópicas y anisotrópicas del potencial gaussiano, como referencia para la familia SPLM.
- Reproducción de experimentos de auditoría causal: el repositorio incluye herramientas para medir la sensibilidad a perturbaciones futuras y verificar la corrección de arquitecturas.

## Benchmarks y rendimiento

El único resultado publicado es la perplejidad de validación sobre OpenWebText, declarada por el autor y no verificada de forma independiente. Además, el propio autor advierte que este valor no debe citarse como válido debido a la fuga causal.

| Dataset | Métrica | Valor | Verificado |
|---|---|---|---|
| OpenWebText (validación) | Perplejidad | 27,23 | No |

La auditoría causal realizada sobre un checkpoint posterior de la misma arquitectura mostró una diferencia de ~33× entre la perplejidad reportada (7,69) y la perplejidad honesta (258,07) tras eliminar la fuga. Aunque este dato no corresponde exactamente a este checkpoint, indica la magnitud del problema.

## Requisitos de hardware

- El modelo tiene 53,4 millones de parámetros, lo que lo hace ligero: en FP32 ocupa aproximadamente 214 MB, y en FP16 unos 107 MB.
- Cabe sin problema en cualquier GPU consumer moderna (RTX 3060 o superior) y también en CPU con suficiente RAM.
- No se dispone de datos oficiales de VRAM, latencia o throughput.
- Al ser un modelo PyTorch, puede ejecutarse con las herramientas estándar de HuggingFace Transformers, aunque al no ser un transformer convencional, es probable que requiera código personalizado del repositorio asociado.
- No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que la arquitectura es única y experimental. La búsqueda web menciona comparaciones de conteo de parámetros con GPT-2 a igual dimensión oculta y profundidad, pero no se proporcionan resultados de rendimiento de GPT-2 en los mismos términos.

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| semsimula-fock-parflm-depthcond-vtheta-openwebtext | 53,4 M | No disponible | No transformer, basado en energía | CC-BY-4.0 |
| GPT-2 (referencia estructural) | 124 M (small) | 1024 | Transformer | MIT |
| Otros modelos de la familia SPLM | Variable | No disponible | No transformer | CC-BY-4.0 |

## Limitaciones y advertencias

- Fuga causal confirmada: el canal inverso comparte estado global entre posiciones, filtrando información futura hacia predicciones pasadas. La perplejidad reportada (27,23) no es válida como medida de calidad autoregresiva.
- El modelo está marcado como superado (superseded) por su autor, que recomienda usar la variante anisotrópica con regularización de acoplamiento de Fock.
- Solo soporta inglés.
- Es un modelo de investigación, sin garantías de calidad ni seguridad para uso en producción.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el estado experimental y la fuga causal lo desaconsejan para cualquier aplicación real.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en dominios específicos.
- El repositorio del repo es de 2,6 GB, lo que sugiere que incluye pesos en varios formatos o checkpoints adicionales, pero no se detalla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-fock-parflm-depthcond-vtheta-openwebtext
- Repositorio del paper y notas complementarias: https://github.com/dimitarpg13/semsimula-paper
- Auditoría de fuga causal: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Fock-PARFLM_Causal_Leak_Audit_Results.md
- Colección de la familia Semantic Simulation SPLM: https://huggingface.co/collections/dimitarpg13/semantic-simulation-splm-model-family
- Variante anisotrópica que lo sustituye: https://huggingface.co/dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta
