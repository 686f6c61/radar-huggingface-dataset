# henly988/fivem-lua-executor-dumper

## Resumen

`henly988/fivem-lua-executor-dumper` es un repositorio alojado en Hugging Face que, a pesar de su identificador y de las etiquetas propias de un modelo, no contiene ningún modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows distribuido como archivo ZIP (`rob-run-cheat-mod-menu-v1.2.2-win64.zip`, 4,8 MB) que se presenta como una herramienta de tipo "executor" y "dumper" orientada a servidores FiveM (mod multijugador de GTA V) y a Roblox. La model card describe funciones de inyección en memoria, attach a procesos, editor Monaco integrado y sincronización de offsets, es decir, capacidades propias de software de trampas y automatización de cliente de juego, no de un sistema de aprendizaje automático.

El repositorio no declara arquitectura de red neuronal, parámetros, ventana de contexto ni pipeline de inferencia; el campo `pipeline` figura como no disponible y las descargas y "likes" son cero. La licencia declarada es MIT, aunque esta se refiere al paquete de software, no a pesos de modelo. El contenido incluye enlaces de descarga alojados en repositorios de GitHub de terceros y una contraseña de descompresión (`2026`), patrón habitual en la distribución de binarios no verificados.

Desde la perspectiva de un desarrollador o investigador que evalúa modelos de IA, este artefacto no es utilizable como modelo: no hay pesos, no hay tokenizador, no hay documentación de entrenamiento ni resultados de evaluación. La ficha se limita, por tanto, a documentar sus especificaciones reales y a advertir de los riesgos asociados a la ejecución de binarios de procedencia no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades lingüísticas verificadas) |
| Licencia | MIT (declarada para el paquete de software) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, sino un binario empaquetado (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`, build `v2.4.7`, firma `F6252DB856`) junto con instrucciones de extracción y ejecución como administrador. La model card menciona componentes como un puente a la máquina virtual Luau, attach directo a memoria de proceso, un editor Monaco y un "script hub" con presets en la nube, pero no documenta ningún proceso de entrenamiento, dataset, técnica de optimización (RLHF, DPO) ni innovación algorítmica.

No hay información sobre tokens de entrenamiento, composición del corpus ni metodología de alineación, porque no existe tal proceso. Cualquier afirmación sobre arquitectura de transformer, MoE o SSM sería inventada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve problemas matemáticos ni escribe código de forma autónoma.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta razonamiento multi-paso ni flujos de agentes.
- No tiene capacidades multilingües verificadas; las etiquetas de idioma de la model card son metadatos de indexación, no una evaluación de competencia lingüística.
- El paquete declara, según su propia documentación, funciones de inyección de scripts Lua en clientes de FiveM/Roblox, attach a múltiples instancias, editor con resaltado de sintaxis y sincronización de offsets tras parches del cliente.
- No incluye modo "thinking", visión, audio ni ninguna modalidad propia de un modelo fundacional.

## Casos de uso

- No procede su uso como modelo de IA en ningún pipeline de generación, clasificación o razonamiento.
- Auditoría de seguridad: un analista podría inspeccionar el binario en un entorno aislado para documentar su comportamiento, sus llamadas al sistema y sus mecanismos de persistencia.
- Investigación de malware: el artefacto sirve como muestra para estudiar patrones de distribución de ejecutables con contraseña de archivo y enlaces a repositorios de terceros.
- Formación en ciberseguridad: puede emplearse como ejemplo didáctico de ingeniería social en torno a supuestas herramientas "gratuitas" para juegos.
- Análisis de cadena de suministro: permite ilustrar cómo un repositorio de Hugging Face puede alojar contenido ajeno a la IA y cómo verificar la procedencia de un artefacto.
- Documentación de políticas: útil para equipos que definan reglas de admisión de artefactos en registros internos y necesiten un caso concreto de binario no verificado.
- En ningún caso debe desplegarse en máquinas de producción, estaciones de trabajo de desarrollo ni entornos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: es un ejecutable para Windows 10/11 de 64 bits.
- El paquete declara un tamaño de 4,8 MB y consumos de memoria de menos de 63 MB, menos de 35 MB y menos de 20 MB según el módulo, cifras no verificables de forma independiente.
- No hay soporte para vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia, porque no hay pesos que cargar.
- No se dispone de datos de latencia o throughput de inferencia; las cifras de "332 Hz de polling" y "< 20 ms de respuesta" que aparecen en la model card son afirmaciones del autor sin validación externa.
- Ejecutarlo implica privilegios de administrador en el sistema anfitrión, lo que supone un riesgo de seguridad considerable.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, ya que el artefacto no es un modelo. Como referencia de contraste, un modelo de lenguaje pequeño real (por ejemplo, de 7-8 mil millones de parámetros con licencia permisiva) se distribuye en safetensors o GGUF, declara contexto, tiene tokenizador y se evalúa con benchmarks públicos; este repositorio no cumple ninguno de esos criterios.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni citarse como tal en comparativas de modelos.
- El binario se distribuye comprimido con contraseña y alojado en repositorios de GitHub de terceros, un patrón frecuente en la distribución de software malicioso o no verificado.
- La model card incluye indicaciones explícitas para desactivar o evitar alertas de Windows Defender y SmartScreen, lo que constituye una señal de alarma de seguridad.
- Ejecutar el `.exe` como administrador otorga privilegios elevados a código de procedencia no verificada.
- La licencia MIT declarada no implica que el contenido sea seguro ni que su uso sea lícito en el contexto de los juegos objetivo; manipular clientes de FiveM o Roblox puede infringir sus términos de servicio.
- No hay sesgos lingüísticos evaluables porque no hay modelo; las etiquetas de idioma no aportan garantía alguna.
- Riesgo de alucinación no aplicable; el riesgo real es de compromiso del sistema, robo de credenciales o instalación de software no deseado.
- No debe incluirse en catálogos internos de modelos ni en procesos de selección de modelos para producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/henly988/fivem-lua-executor-dumper
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio de releases citado en la model card (GitHub, terceros): https://github.com/shirleyrichardson/fivem-lua-executor-dumper/releases/latest
- Paper, blog o demo oficial: no disponible
