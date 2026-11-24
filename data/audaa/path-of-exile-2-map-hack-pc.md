# audaa/path-of-exile-2-map-hack-pc

## Resumen

La entrada `audaa/path-of-exile-2-map-hack-pc` alojada en Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`, build `v3.8.2`) empaquetado en un archivo ZIP de 4,8 MB protegido con la contraseña `2026`. La model card describe funcionalidades propias de una herramienta de trampas para el videojuego Path of Exile 2: radar 2D, overlay externo, ESP con cajas delimitadoras y esqueletos, suavizado de entrada tipo Bézier y perfiles JSON intercambiables en caliente.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje. Los tags declarados (`windows`, `windows-11`, `x64`, `portable`) y la ausencia de pipeline confirman que se trata de un binario de aplicación, no de un modelo entrenado. Cualquier evaluación como modelo de IA carece de sentido técnico: no hay parámetros, contexto, dataset ni proceso de entrenamiento que analizar.

Desde la perspectiva de la seguridad, la publicación presenta varios indicadores de riesgo habituales en campañas de distribución de malware: binario ejecutable alojado en un repositorio de terceros, archivo comprimido con contraseña (técnica usada para evadir el análisis automático de antivirus), instrucciones para ejecutar como administrador y redirecciones a repositorios de GitHub ajenos al espacio de nombres del autor. Esta ficha documenta el artefacto y sus riesgos, no valida sus supuestas capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable nativo de Windows de 64 bits, distribuido como `rob-run-cheat-mod-menu-v1.2.2-win64.zip` (4,8 MB) y protegido con contraseña. La model card enumera supuestos subsistemas internos (escáner dinámico de offsets, capa de render excluida de capturas, radar 2D, overlay a 144 Hz, suavizado Bézier a 346 Hz de sondeo, perfiles JSON), pero no aporta documentación técnica verificable, código fuente ni trazabilidad del binario.

No se declaran datos de entrenamiento, tokens procesados, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. La etiqueta `license: mit` en los metadatos no aclara la procedencia del binario ni su cadena de compilación.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos del repositorio.
- No dispone de modo thinking, visión, audio ni ninguna capacidad propia de un modelo fundacional.
- El binario afirma ofrecer, según su propia model card y sin verificación independiente: radar 2D con filtro de loot, overlay externo con cajas y esqueletos, suavizado de puntería y perfiles de configuración intercambiables.

## Casos de uso

- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real antes de cualquier otra consideración.
- Investigación de campañas de malware: estudiar el patrón de distribución (ZIP con contraseña, ejecución como administrador, redirección a repositorios de GitHub de terceros) como caso de ingeniería social.
- Formación en ciberseguridad: usar el artefacto como ejemplo didáctico de indicadores de compromiso y de por qué no deben ejecutarse binarios de procedencia desconocida.
- Denuncia y retirada de contenido: documentar la publicación para reportarla a Hugging Face y a GitHub si se confirma que infringe sus políticas.
- Análisis de reputación de repositorios: evaluar cómo los metadatos de Hugging Face (tags, licencia, idiomas) pueden no reflejar la naturaleza real del contenido alojado.
- No se recomienda ningún uso del ejecutable en un equipo de producción, personal o de juego, por el riesgo de compromiso del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen métricas como MMLU, HumanEval o GSM8K aplicables.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de modelo.
- GPU: no aplica.
- CPU y sistema operativo: Windows 10 o Windows 11 de 64 bits, según la model card.
- Almacenamiento: el archivo ZIP ocupa 4,8 MB; el espacio descomprimido no se especifica.
- Memoria RAM: la model card afirma un consumo inferior a 60 MB para el radar y a 28 MB para los perfiles, sin verificación independiente.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Criterio | `audaa/path-of-exile-2-map-hack-pc` | Modelo de lenguaje open source (p. ej. familia Llama, Qwen, Mistral) | Herramienta legítima de accesibilidad o overlay |
|---|---|---|---|
| Naturaleza | Binario ejecutable para Windows | Pesos de red neuronal | Software de aplicación |
| Parámetros | No aplica | Miles de millones | No aplica |
| Contexto | No aplica | Decenas de miles de tokens | No aplica |
| Licencia | MIT (metadatos) | Licencias abiertas verificables | Variable |
| Distribución | ZIP con contraseña en repositorio de terceros | Safetensors/GGUF en repositorios oficiales | Canales oficiales del desarrollador |
| Verificabilidad | Nula (sin código fuente ni firma) | Alta (pesos y documentación públicos) | Media-alta |

No se identifican alternativas legítimas comparables dentro de la categoría de modelos de IA, porque el artefacto no pertenece a ella.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- Riesgo elevado de malware: ejecutable sin firma, distribuido en ZIP con contraseña para evadir el escaneo automático, con instrucciones de ejecución como administrador.
- Suplantación de identidad: la model card redirige a repositorios de GitHub (`cishii039`, `waelbrouwer`) ajenos al espacio de nombres del autor en Hugging Face, lo que dificulta atribuir el origen.
- Incumplimiento de términos de servicio: las herramientas de trampas para videojuegos violan habitualmente los acuerdos de usuario de los juegos y pueden conllevar el bloqueo de cuentas.
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre la legalidad ni la seguridad del binario.
- No hay evidencia de sesgos, alucinaciones o limitaciones de contexto porque no hay modelo; el riesgo relevante es de seguridad informática, no de calidad de salida.
- Recomendación: no descargar ni ejecutar el archivo; reportar la publicación a Hugging Face si se confirma que infringe sus políticas de contenido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/audaa/path-of-exile-2-map-hack-pc
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/cishii039/rob-run-cheat-mod-menu
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/waelbrouwer/path-of-exile-2-map-hack-pc
- Política de contenido de Hugging Face: https://huggingface.co/content-guidelines
