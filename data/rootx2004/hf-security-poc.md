# rootx2004/hf-security-poc

## Resumen

El repositorio `rootx2004/hf-security-poc` no contiene un modelo de inteligencia artificial, sino un intento de phishing dirigido a usuarios de Hugging Face. Publicado el 2 de septiembre de 2026 por el usuario `rootx2004`, su model card incluye HTML incrustado que simula una advertencia de seguridad falsa ("Your HuggingFace session has expired") y solicita al visitante que introduzca su token de acceso personal en un formulario que redirige a un dominio externo (`attacker.example`). También incorpora píxeles de seguimiento y enlaces de rastreo.

Este repositorio es un ejemplo de vector de ataque en la cadena de suministro de IA, aprovechando la confianza de los desarrolladores que buscan modelos en Hugging Face. No existe ninguna arquitectura, peso o funcionalidad de modelo; se trata exclusivamente de un payload malicioso. Cualquier interacción con su contenido (ejecutar el HTML, hacer clic en los enlaces o introducir credenciales) compromete la seguridad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (contiene HTML malicioso) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni ningún artefacto de aprendizaje automático. Su contenido se limita a un documento HTML con estilos CSS y JavaScript embebido, diseñado para imitar la interfaz de Hugging Face y engañar al usuario para que revele su token de acceso. No hay datos de entrenamiento, pesos, configuraciones ni código de inferencia.

## Capacidades

- No posee ninguna capacidad de generación de texto, razonamiento, código, visión o audio.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No ofrece funcionalidad multilingüe.
- Su única "capacidad" es la de ejecutar un ataque de phishing: mostrar un formulario falso, enviar los datos introducidos a un servidor externo y rastrear la interacción mediante píxeles invisibles.

## Casos de uso

No existen casos de uso legítimos para este repositorio. Cualquier uso que implique abrir su model card, ejecutar su HTML o seguir sus enlaces conlleva un riesgo directo de robo de credenciales. No debe emplearse en ningún flujo de desarrollo, investigación o producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen métricas de rendimiento, precisión o latencia que reportar.

## Requisitos de hardware

No aplica. No hay inferencia que ejecutar, por lo que no se requieren GPU, VRAM ni recursos de cómputo. El único "hardware" implicado es el navegador de la víctima, que renderiza el HTML malicioso.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que este repositorio no es un modelo de IA sino un artefacto malicioso. En el ecosistema de Hugging Face, los repositorios legítimos de modelos de lenguaje (por ejemplo, Llama, Mistral, Qwen) ofrecen pesos, configuraciones y documentación técnica; este no contiene nada de eso.

## Limitaciones y advertencias

- **Riesgo de robo de credenciales**: el formulario incrustado solicita el token de Hugging Face y lo envía a un dominio externo controlado por el atacante. Introducir cualquier dato compromete la cuenta y los repositorios asociados.
- **Phishing activo**: la model card imita una advertencia de seguridad oficial para inducir al usuario a actuar con urgencia. No es una comunicación legítima de Hugging Face.
- **Rastreo de usuarios**: incluye píxeles de seguimiento (`pixel-view-id=1`, `css-url-view-id=1`, `srcset-view-id=1`) que pueden registrar la IP, el navegador y la interacción del visitante.
- **Sin licencia ni garantías**: al no ser un modelo, no existe licencia de uso, términos de servicio ni responsabilidad legal por parte del autor.
- **No apto para producción**: cualquier integración de este repositorio en un pipeline de IA o en un sistema de descarga automatizada de modelos expone a la organización a un compromiso de seguridad.
- **Recomendación**: no abrir el repositorio, no hacer clic en sus enlaces y reportarlo a Hugging Face como contenido malicioso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rootx2004/hf-security-poc
- Búsqueda de modelos con tag `security-poc`: https://huggingface.co/models?other=security-poc
- Artículo sobre la brecha de seguridad de Hugging Face en 2026: https://datasciencedojo.com/blog/hugging-face-security-breach-2026/
- Análisis del ataque con agente de IA: https://insiderllm.com/guides/hugging-face-ai-agent-breach/
- Noticia sobre exposición de modelos privados: https://undercodetesting.com/hugging-face-hit-200-private-ai-models-exposed-in-devsecops-supply-chain-attack-video/
