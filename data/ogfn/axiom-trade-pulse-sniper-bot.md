# ogfn/axiom-trade-pulse-sniper-bot

## Resumen

El identificador `ogfn/axiom-trade-pulse-sniper-bot` alojado en Hugging Face no corresponde a un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip`, 4,8 MB) presentado como bot de trading de criptomonedas con módulos de sniper, bundler de wallets y motor de bundles Jito/MEV. El contenido de la model card no describe arquitectura de red neuronal, pesos, tokenizador ni datos de entrenamiento en ningún momento.

La ficha se redacta, por tanto, como evaluación técnica del artefacto publicado, no de un modelo lingüístico. La relevancia de documentarlo es alta para la comunidad: el patrón observado (nombre de proyecto atractivo, repositorio de GitHub ajeno, ZIP protegido con contraseña, instrucciones para desactivar SmartScreen y ejecutar como administrador) coincide con la estructura típica de campañas de distribución de malware. Cualquier desarrollador que encuentre este repositorio buscando un modelo de IA debe saber que no lo es.

No hay información pública sobre parámetros, contexto, cuantizaciones ni licencia de pesos porque no existen pesos. La licencia declarada en los metadatos es MIT, pero se aplica a un repositorio sin código fuente verificable ni binarios auditables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no del modelo) |
| Licencia | MIT (declarada en metadatos; sin código fuente ni binarios auditables) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto es un binario `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card menciona módulos funcionales (bundler de 20 wallets con Lookup Tables, take profit multinivel, sandbox de paper trading, motor de bundles Jito/MEV, filtro antihoneypot, copytrade de smart money), pero no documenta lenguaje de implementación, dependencias, cadena de compilación ni firma de código.

No hay información sobre datos de entrenamiento, tokens procesados, composición del dataset, RLHF, DPO ni innovaciones técnicas de inferencia. El repositorio de GitHub referenciado en los enlaces de descarga (`Roussel10024/inzoi-cheat-trainer-mod-menu`) no coincide con el nombre del proyecto ni con el autor declarado (`parker41309`), lo que constituye una inconsistencia de trazabilidad relevante.

## Capacidades

- Según la model card, el binario afirmaría incluir: bundler de 20 wallets con Lookup Tables para ejecución multimoneda en el mismo bloque.
- Take profit multinivel con migración a trailing stop.
- Sandbox de paper trading contra libros de órdenes en vivo.
- Motor de bundles Jito/MEV con dimensionamiento dinámico de propinas.
- Filtro previo a la compra de honeypots (verificación de autoridades mint/freeze y bloqueo de LP).
- Copytrade de wallets de smart money con dimensionamiento proporcional.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multietapa, visión, audio ni ninguna capacidad propia de un modelo de lenguaje.
- No hay evidencia verificable de que estas funciones existan más allá de la descripción textual de la model card.

## Casos de uso

- Auditoría de seguridad: analizar el ZIP y el ejecutable en un entorno aislado (sandbox sin red, máquina virtual desechable) para determinar si el binario coincide con la funcionalidad declarada o si contiene carga maliciosa. Es el uso realista principal de este artefacto.
- Investigación de campañas de distribución: catalogar el patrón de nombres (proyecto de trading + cheat/trainer + contraseña en el ZIP) para alimentar reglas de detección en plataformas de hosting de modelos.
- Formación en concienciación: usar el repositorio como ejemplo documentado de por qué no deben ejecutarse binarios descargados de hubs de modelos ni desactivarse SmartScreen siguiendo instrucciones de una model card.
- Verificación de trazabilidad: comprobar la discrepancia entre el autor declarado (`ogfn`), el repositorio de GitHub enlazado (`Roussel10024`) y el usuario mencionado en el texto (`parker41309`), como ejercicio de análisis de cadena de suministro.
- Bloqueo en pipelines: incluir el identificador del repositorio en listas de denegación de proxies o escáneres de dependencias para evitar que se descargue en entornos corporativos.
- No se recomienda ningún caso de uso operativo (trading, automatización financiera) con este artefacto: no hay evidencia de que funcione y el riesgo de ejecución es alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una valoración de "4,9/5" en un badge, sin metodología, muestra ni fuente verificable; no constituye un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Huella declarada: ZIP de 4,8 MB; consumo de RAM mencionado en la model card de "< 22 MB" y "< 42 MB" según módulo, sin verificación independiente.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Como referencia de categoría, los repositorios de modelos reales en Hugging Face publican pesos en safetensors o GGUF, tokenizador, configuración de arquitectura y, habitualmente, resultados de evaluación; ninguno de estos elementos está presente aquí.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje. Cualquier expectativa de uso como modelo lingüístico es errónea.
- Riesgo de seguridad alto: binario `.exe` distribuido en un ZIP con contraseña, alojado en un repositorio de GitHub de un tercero distinto del autor declarado, con instrucciones explícitas para ejecutarlo como administrador y para ignorar alertas de Windows Defender y SmartScreen.
- Inconsistencia de identidad: el ID del hub es `ogfn/axiom-trade-pulse-sniper-bot`, el enlace de descarga apunta a `Roussel10024/inzoi-cheat-trainer-mod-menu` y el texto menciona `parker41309/axiom-trade-pulse-sniper-bot`. Tres identidades distintas para un mismo artefacto.
- Nombre del ejecutable incongruente: `inzoi-cheat-trainer-mod-menu` no guarda relación con un bot de trading; sugiere reutilización de un empaquetado previo o señuelo.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario ni permite verificar su contenido; sin código fuente, la auditoría es imposible sin ingeniería inversa.
- Afirmaciones funcionales no verificables (bundler de 20 wallets, motor Jito/MEV, filtro antihoneypot) sin repositorio de código, tests ni documentación técnica.
- Uso comercial: desaconsejado en cualquier circunstancia; además, la operativa de trading automatizado con bundles MEV puede infringir términos de servicio de plataformas y normativa financiera según jurisdicción.
- Fecha de creación declarada en 2026-11-24, posterior a la fecha habitual de consulta, lo que puede indicar manipulación de metadatos o error del hub.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ogfn/axiom-trade-pulse-sniper-bot
- Repositorio de GitHub mencionado en el texto: https://github.com/parker41309/axiom-trade-pulse-sniper-bot
- Releases del repositorio de GitHub enlazado en la descarga: https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Página de releases alternativa citada: https://github.com/parker41309/axiom-trade-pulse-sniper-bot/releases/latest
- Paper, blog o demo oficial: no disponible.
