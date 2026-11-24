# nunky/deadlock-cheat-aimbot-esp-unlocked

## Resumen

El repositorio `nunky/deadlock-cheat-aimbot-esp-unlocked` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete de software etiquetado como "cheat" (trampa) para el videojuego Deadlock. La model card describe un ejecutable de Windows de 4,8 MB distribuido como archivo ZIP protegido con contraseña, junto con módulos de tipo aimbot, ESP (extra sensory perception), radar 2D y escáner de offsets. No se declara ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia.

Los metadatos de Hugging Face (0 descargas, 0 likes, sin pipeline definido) y la naturaleza del contenido indican que se trata de un artefacto ajeno a la categoría de modelos de lenguaje o de visión. La ficha siguiente documenta lo que la información disponible permite verificar, señalando explícitamente los apartados en los que no existe dato técnico alguno.

Desde la perspectiva de un editor técnico, este artefacto no es evaluable como modelo de IA: no hay parámetros, contexto, cuantizaciones ni licencia de pesos que analizar. Se advierte además de que el contenido enlaza a binarios ejecutables de origen no verificado, lo que constituye un riesgo de seguridad relevante para cualquier lector.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable de Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT (según metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe`, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe componentes de software de tipo "user-mode external core", overlay externo a 144 Hz, radar 2D, filtro de loot y escáner dinámico de offsets, presentados como módulos de un ejecutable de Windows. No se especifican datos de entrenamiento, tokens, composición de dataset, RLHF, DPO ni ninguna innovación en el ámbito del aprendizaje automático.

El único dato técnico verificable es la referencia a un binario `blox-fruits-script-keyless-2026-v1.2.2-win64.exe` (build `v1.9.4`, `DC5DA9`) empaquetado en un ZIP de 4,8 MB con contraseña `2026`. La model card mezcla nombres de repositorios y de artefactos distintos (referencias a `alejandronowak95/...` y a `JisungDiaz447/blox-fruits-script-keyless-2026`), lo que apunta a contenido copiado o generado de forma automatizada.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe real más allá de la lista de idiomas en metadatos.
- El artefacto se presenta como un ejecutable de Windows con módulos de trampa para un videojuego, sin relación con capacidades de IA.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no tiene aplicaciones legítimas de inferencia.
- No se identifica ningún caso de uso profesional, educativo o de investigación asociado a este repositorio.
- Cualquier uso del binario distribuido implicaría ejecutar software de origen no verificado en un sistema Windows, con el riesgo de seguridad correspondiente.
- El contenido incumple presumiblemente las condiciones de servicio del videojuego al que hace referencia, por lo que su uso conllevaría riesgo de sanción en la cuenta del usuario.
- No se recomienda su descarga, instalación ni integración en ningún entorno.
- No existe documentación que permita evaluar su comportamiento en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica: no hay modelo de IA que ejecutar, por lo que no procede estimar VRAM ni seleccionar GPU.
- El artefacto declara ser un ejecutable de Windows x64 para Windows 10/11 de 64 bits.
- No se especifican requisitos de CPU, RAM o GPU más allá de menciones genéricas a consumo de memoria en la propia model card.
- No se documentan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, al no tratarse de un modelo.
- No se dispone de datos de latencia ni throughput de inferencia.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable, ya que el artefacto no es un modelo de IA sino un paquete ejecutable de dudosa procedencia.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: la model card describe un ejecutable de Windows etiquetado como trampa para un videojuego.
- El binario se distribuye como ZIP con contraseña y enlaces a repositorios de GitHub de terceros, un patrón habitual en campañas de distribución de malware.
- La model card mezcla identificadores de repositorios y nombres de artefactos incoherentes, lo que sugiere contenido generado automáticamente o copiado.
- No hay verificación de integridad, firma de código ni auditoría del ejecutable.
- El uso de software de trampa en videojuegos puede vulnerar los términos de servicio y acarrear el bloqueo de cuentas.
- La licencia MIT declarada en metadatos no aporta ninguna garantía sobre el contenido ni sobre el binario distribuido.
- Riesgo elevado de seguridad: no se recomienda descargar, extraer ni ejecutar el archivo en ningún sistema.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nunky/deadlock-cheat-aimbot-esp-unlocked
- Repositorio de GitHub referenciado en la model card: https://github.com/alejandronowak95/deadlock-cheat-aimbot-esp-unlocked
- Repositorio de GitHub referenciado en la model card: https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información proporcionada.
