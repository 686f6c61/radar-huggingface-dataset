# onebase2026/once-human-cheat-trainer

## Resumen

El repositorio `onebase2026/once-human-cheat-trainer` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 (versión declarada `v1.5.4`) distribuido como archivo comprimido de 4,8 MB bajo el nombre `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip`, con contraseña de extracción `2026`. La model card lo presenta como un "cheat trainer" para el videojuego *Once Human*, con módulos de overlay externo, ESP (cajas delimitadoras y esqueletos), suavizado de entrada tipo Bézier y escáner dinámico de offsets.

Desde el punto de vista técnico, no existe aquí arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia. La ficha de Hugging Face incluye etiquetas propias de un binario (`windows`, `windows-11`, `x64`, `portable`) y una licencia MIT declarada, pero ningún artefacto relacionado con aprendizaje automático. El contenido es, por tanto, ajeno a la categoría de modelos open source que cubre esta publicación.

La relevancia de documentarlo no es técnica en el sentido de IA, sino de seguridad: la model card incluye enlaces a releases de GitHub de terceros, un binario firmado con nombre no coincidente con el proyecto, instrucciones para ejecutarlo como administrador y recomendaciones explícitas para sortear alertas de Windows Defender o SmartScreen. Todo ello configura un patrón habitual de distribución de software potencialmente no deseado o malicioso, y no un modelo evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos del repositorio) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (artefacto distribuido como `.zip` con `.exe` en su interior) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de transformer, MoE, SSM ni híbrida, ni datos de entrenamiento, ni fases de RLHF/DPO. El artefacto descrito es un ejecutable de Windows x64 (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`, build `7D97CA`) empaquetado en un ZIP de 4,8 MB con contraseña. La model card describe módulos de tiempo de ejecución (overlay externo a 144 Hz o más, escáner de offsets, perfiles JSON intercambiables en caliente, tecla de pánico `END`) orientados a interactuar con el proceso del juego *Once Human*.

No se documenta ningún proceso de entrenamiento, dataset, tokenizador ni innovación en el sentido de IA. La única "innovación" descrita es de ingeniería de software ofensivo: resolución automática de firmas de punteros tras parches del juego y suavizado de curvas de entrada para simular comportamiento humano.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de API de modelos.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos del repositorio, no capacidades del artefacto.
- Funcionalidad declarada por el autor (no verificada): overlay externo con cajas 2D/3D y esqueletos, ESP con distancias, suavizado de entrada Bézier con radio de FOV configurable, escáner dinámico de offsets, perfiles JSON intercambiables y tecla de pánico.
- Consumo declarado: menos de 36 MB de RAM para el núcleo en modo usuario, menos de 60 MB para el overlay, menos de 22 MB para el escáner de offsets.

## Casos de uso

- No procede evaluar casos de uso legítimos de IA: el artefacto no es un modelo y su finalidad declarada es alterar la experiencia de un videojuego multijugador, lo que suele contravenir los términos de servicio del juego.
- Auditoría de seguridad defensiva: un analista puede usar la descripción y los indicadores de la model card (contraseña en el ZIP, binario con nombre ajeno al proyecto, instrucciones para desactivar SmartScreen) como muestra para formar reglas de detección en EDR o en filtros de correo.
- Formación en concienciación: el repositorio sirve como ejemplo didáctico de ingeniería social y de empaquetado engañoso en plataformas de modelos.
- Investigación de cadena de suministro: permite estudiar cómo se abusa de Hugging Face para alojar binarios ajenos a la IA y redirigir tráfico a releases de GitHub de terceros.
- Respuesta a incidentes: útil como referencia de IoC (nombre de ZIP, contraseña, build `7D97CA`) para búsquedas en entornos comprometidos.
- No se identifican casos de uso productivos legítimos en desarrollo de software, investigación en IA ni despliegue de servicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque el artefacto no es un modelo de lenguaje. Las únicas cifras de la model card son de consumo de memoria del binario (menos de 36 MB, 50 MB, 60 MB y 22 MB según módulo), no verificables de forma independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- CPU: Intel o AMD x64; no se especifican requisitos mínimos de núcleos ni frecuencia.
- GPU: no se requiere GPU; el overlay se describe como renderizado por Desktop Duplication en modo usuario.
- VRAM: no aplica.
- Memoria RAM: el autor declara menos de 60 MB para el módulo más pesado; no verificable.
- Almacenamiento: 4,8 MB para el ZIP; el tamaño descomprimido no se indica.
- Opciones de despliegue en inferencia (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no disponibles en el sentido de inferencia; el autor menciona frecuencias de sondeo de 298 Hz y refresco de overlay de 144 Hz o más, sin metodología de medición.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, porque el artefacto no es un modelo. Frente a otros repositorios de la misma plataforma, la diferencia relevante es que este no contiene pesos, tokenizador ni configuración de inferencia, sino un ejecutable de Windows. Cualquier comparación con modelos de lenguaje, visión o audio sería categorialmente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en catálogos, comparativas ni evaluaciones de modelos.
- Riesgo de seguridad elevado: la model card incluye instrucciones para ejecutar el binario como administrador y para sortear alertas de Windows Defender y SmartScreen, lo que es un indicador clásico de software potencialmente no deseado o malicioso.
- Inconsistencia de nombres: el ZIP y el ejecutable se denominan `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64`, mientras que el repositorio se llama `once-human-cheat-trainer`; esta discrepancia sugiere reutilización de empaquetado o suplantación.
- Origen opaco: los enlaces de descarga apuntan a releases de GitHub de cuentas de terceros (`carlos7088`, `alexandros6727`), no verificadas ni vinculadas al autor del repositorio.
- Contraseña en el archivo comprimido (`2026`): técnica habitual para evadir análisis automático de antivirus y filtros de correo.
- Licencia MIT declarada pero sin archivo `LICENSE` verificable en la información proporcionada; el uso comercial del binario, además, entrañaría riesgos legales por los términos de servicio del videojuego y por la naturaleza del software.
- Idiomas listados en metadatos sin respaldo funcional; no hay interfaz ni documentación multilingüe descrita.
- Cero descargas y cero likes en el momento de la consulta, lo que reduce la trazabilidad de terceros y la validación comunitaria.
- No debe ejecutarse en entornos de producción ni en máquinas con datos sensibles sin análisis previo en una sandbox aislada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onebase2026/once-human-cheat-trainer
- Release referenciada en la model card (cuenta de terceros): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Releases alternativas citadas (cuenta de terceros): https://github.com/alexandros6727/once-human-cheat-trainer/releases/latest
- Paper, blog, demo o repositorio oficial del supuesto modelo: no disponible.
