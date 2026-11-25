# rzzars/autopilotpm-polymarket-kalshi-ai-terminal

## Resumen

`rzzars/autopilotpm-polymarket-kalshi-ai-terminal` es un repositorio alojado en Hugging Face que, a pesar de su identificador y de las etiquetas asociadas (windows, windows-11, x64, portable), no contiene un modelo de inteligencia artificial en el sentido convencional. La model card describe un supuesto ejecutable portable para Windows de 64 bits, distribuido como archivo ZIP de 4,8 MB protegido con contraseña, junto con instrucciones para descargarlo desde enlaces externos de GitHub y ejecutarlo como administrador. No se publican pesos, arquitectura, tokenizador ni pipeline de inferencia.

El contenido se presenta como un "terminal de IA" para trading en mercados de predicción (Polymarket y Kalshi), con módulos de copia de carteras, filtros antiharvesting, bóveda local de claves AES-256 y enrutamiento de órdenes. Sin embargo, la propia model card mezcla nombres de proyecto distintos (referencias a un supuesto bot de sniper en Pump.fun y Jito), lo que resulta incoherente con el identificador del repositorio y es señal habitual de contenido malicioso o de spam.

Desde la perspectiva de evaluación de modelos, este repositorio no es utilizable como modelo de IA: no hay artefactos de pesos, no hay datos de entrenamiento, no hay benchmarks y no hay código de inferencia verificable. La ficha se limita a documentar lo que el autor declara, marcando explícitamente como no disponible todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe ninguna arquitectura de red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como etiquetas del repositorio, no como capacidad del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` de Windows, no pesos de modelo) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo. La model card no menciona transformer, MoE, SSM ni ningún otro tipo de red, ni tampoco tokenizador, función de pérdida, dataset, número de tokens de entrenamiento, proceso de RLHF, DPO o cualquier otra técnica de alineación. El contenido se centra en la instalación de un ejecutable y en la descripción funcional de módulos de trading.

Los únicos datos técnicos declarados son de infraestructura de la aplicación, no del modelo: plataforma objetivo x64 Windows, build `v2.6.2 (A28F03)`, uso de 14 hilos de trabajo para la bóveda de claves y 9 hilos para el enrutamiento de órdenes, latencia declarada inferior a 40 ms en el enrutamiento y de 31 ms en el filtro antiharvesting, y una "consistencia" del 98,3 % en el módulo de copia de carteras. Ninguno de estos valores es verificable con la información disponible.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe real; los idiomas figuran solo como etiquetas del repositorio.
- El autor declara funciones propias de una aplicación de trading: gestión de take profit multinivel, copia de carteras de "smart money", bóveda local de claves AES-256, enrutamiento de órdenes por WebSocket y gRPC, sandbox de paper trading y filtro antiharvesting previo a la compra. Estas funciones no son capacidades de un modelo de IA y no se pueden verificar.

## Casos de uso

- No se pueden proponer casos de uso legítimos de inferencia porque no existe un modelo desplegable con pesos o API documentada.
- Evaluación de seguridad de la cadena de suministro: el repositorio puede usarse como caso de estudio de técnicas de distribución de ejecutables no verificados con contraseña en archivos ZIP y enlaces externos.
- Auditoría de repositorios de Hugging Face: sirve como ejemplo de etiquetado incorrecto (tags de sistema operativo en lugar de framework o pipeline) y de mezcla de identidades de proyecto.
- Formación en detección de phishing: los enlaces de descarga externos, la contraseña fija en el propio README y la incoherencia entre nombres de proyecto son patrones reconocibles en campañas de distribución de malware.
- No se recomienda su uso en producción, ni en entornos de trading real, ni en pipelines de datos o de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay pesos de modelo ni requisitos de VRAM documentados.
- El autor declara como plataforma objetivo exclusivamente Windows de 64 bits (10 u 11), sin mención de GPU, CUDA, ROCm ni aceleradores.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún otro motor de inferencia.
- Las cifras de latencia (< 40 ms en enrutamiento, < 31 ms en filtro) y de hilos de trabajo (14 y 9) son declaraciones del autor no verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el repositorio no contiene un modelo de IA con pesos, arquitectura o benchmarks que permitan una comparación técnica con otros modelos de lenguaje, visión o multimodalidad.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuración ni código de inferencia.
- La model card incluye instrucciones para descargar y ejecutar un `.exe` desde enlaces externos de GitHub, con contraseña fija (`2026`) y petición de ejecución como administrador. Este patrón es característico de campañas de distribución de software no verificado o malicioso.
- Incoherencia de identidad: el identificador del repositorio (`autopilotpm-polymarket-kalshi-ai-terminal`) no coincide con el nombre del archivo distribuido (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip`), lo que sugiere reutilización de contenido o suplantación.
- Las cifras de rendimiento declaradas (latencia, consistencia, número de hilos) no van acompañadas de metodología ni de artefactos reproducibles.
- La licencia MIT se declara sobre el repositorio, pero no queda claro a qué artefacto se aplica ni si cubre el ejecutable distribuido por canales externos.
- Riesgo de seguridad: ejecutar binarios de origen no verificado con privilegios de administrador expone el sistema a compromiso. No se debe descargar ni ejecutar en entornos de producción o con credenciales reales.
- No se debe tratar este repositorio como fuente de un modelo para evaluación técnica, benchmarking o integración en pipelines de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rzzars/autopilotpm-polymarket-kalshi-ai-terminal
- Enlace de descarga externo citado en la model card (no verificado, no recomendado): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Página de releases citada en la model card: https://github.com/Rebecca26040/autopilotpm-polymarket-kalshi-ai-terminal/releases/latest
