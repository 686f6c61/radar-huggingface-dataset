# Parvez113/otp-work-hub-src

## Resumen

`Parvez113/otp-work-hub-src` no es un modelo de inteligencia artificial. Se trata del repositorio de código fuente de una aplicación web denominada «OTP WORK HUB», publicada en HuggingFace Spaces con SDK de Docker. La aplicación, según su propia model card, es una plataforma para recibir códigos OTP por SMS, con panel de administración (11 pestañas) y panel de usuario (9 pestañas), autenticación por email vía SMTP de Gmail, precios por rango de números, comisiones por referidos del 5 %, API REST con autenticación Bearer y scrapers de paneles de terceros implementados con Playwright. El stack declarado es Next.js 16 con TypeScript, Prisma ORM sobre SQLite, Tailwind CSS y componentes shadcn/ui.

El problema que aborda es la gestión y reventa de números de teléfono virtuales para recepción de OTP, un modelo de negocio habitual en servicios de verificación de cuentas. No hay ningún componente de aprendizaje automático, pesos, tokenizador ni arquitectura neuronal en la información disponible: el pipeline no está definido, no hay descargas ni likes, y los idiomas no están declarados. Cualquier ficha técnica de tipo «modelo» resulta, por tanto, inaplicable en sus apartados de parámetros, contexto, cuantización y benchmarks.

La relevancia de esta entrada es más bien documental y de advertencia: el repositorio expone credenciales de administrador por defecto en texto plano y depende de la scrapeación de paneles de terceros, lo que plantea riesgos de seguridad, legales y de términos de servicio. Los resultados de búsqueda web proporcionados (artículos sobre la ciudad francesa de Amiens) no guardan ninguna relación con el proyecto y no aportan información técnica utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es una aplicación web Next.js 16 + TypeScript con Prisma ORM y SQLite) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica; no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no declarados en la model card ni en los tags) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; el artefacto es código fuente y una imagen Docker) |

Datos adicionales del repositorio: identificador `Parvez113/otp-work-hub-src`, autor `Parvez113`, 0 descargas, 0 likes, creado el 2026-10-24T16:58:20Z y actualizado el 2026-10-24T16:58:48Z (28 segundos después), región `us`, puerto de aplicación 7860, SDK `docker`.

## Arquitectura y entrenamiento

No existe entrenamiento. El artefacto es una aplicación web full-stack: frontend y backend en Next.js 16 con TypeScript, persistencia mediante Prisma ORM sobre SQLite (ruta por defecto `file:/data/db.sqlite`), estilos con Tailwind CSS y biblioteca de componentes shadcn/ui, y automatización de navegador con Playwright para los scrapers de paneles externos (Bolt, Core, Sniper, Kazi). La autenticación de usuarios se apoya en verificación por correo electrónico mediante SMTP de Gmail, y la API REST expone autenticación por token Bearer.

La configuración se realiza por variables de entorno en los ajustes del Space: `DATABASE_URL`, `SESSION_SECRET` (se recomienda una cadena hexadecimal aleatoria de 32 caracteres), `SMTP_URL` (por ejemplo `smtps://user:pass@smtp.gmail.com:465`), `SMTP_FROM`, `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`. La model card documenta un inicio de sesión de administrador por defecto con correo `fahim563535@gmail.com` y contraseña `Adminv123`, sembrado a partir de esas dos últimas variables. No se documentan innovaciones técnicas de tipo decodificación especulativa, atención lineal ni similares, porque no hay inferencia de lenguaje implicada.

## Capacidades

- Panel de administración con 11 pestañas: analíticas, pool de rangos, pool de números, paneles, proveedores de API, último OTP, consola OTP, usuarios, retiradas, difusión y ajustes.
- Panel de usuario con 9 pestañas: escritorio, obtención de número, consola en vivo, historial, monedero, claves de API, perfil, actividad y notificaciones.
- Verificación de correo electrónico mediante SMTP de Gmail.
- Tarificación de OTP por rango de números.
- Sistema de referidos con comisión del 5 % de forma indefinida.
- Importación automática de paneles de terceros en el pool de rangos (Bolt, Core, Sniper, Kazi).
- Flujo «Kazi stream»: OTP en tiempo real con los números ocultos.
- Animación de bienvenida («premium splash animation»).
- API REST con autenticación Bearer.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni modo de razonamiento, al no ser un modelo lingüístico.

## Casos de uso

- Recepción de OTP para verificación de cuentas: la plataforma asigna números del pool y muestra los códigos entrantes en la consola en vivo del usuario, con historial persistido en SQLite.
- Reventa de acceso por rangos: el administrador define precios por rango de números y los usuarios compran acceso con saldo del monedero, lo que permite segmentar la oferta por operador o país.
- Integración en pipelines de automatización: la API REST con Bearer permite solicitar un número y consultar el OTP resultante desde scripts o servicios propios, sin intervención de la interfaz.
- Agregación de proveedores externos: la importación automática desde paneles Bolt, Core, Sniper y Kazi amplía el inventario de números sin gestión manual, aunque depende de scrapers con Playwright que se rompen si cambia el HTML del proveedor.
- Operación de un servicio con afiliados: el programa de referidos con comisión del 5 % permanente permite captar usuarios Revendedores y liquidar retiradas desde la pestaña de administración correspondiente.
- Comunicación a la base de usuarios: la pestaña de difusión (broadcast) sirve para anunciar cambios de tarifas, caídas de proveedores o nuevas rutas disponibles.
- Despliegue de demostración: al publicarse como Space Docker en el puerto 7860, permite levantar una instancia de prueba con SQLite persistido en `/data` sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de lenguaje, no existen métricas de MMLU, HumanEval, GSM8K ni equivalentes; la model card solo enumera funcionalidades, sin cifras de latencia, throughput ni cobertura.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no aplica, no hay inferencia de modelo neuronal.
- GPU recomendadas: no disponible; la aplicación no requiere GPU. Los scrapers con Playwright pueden ejecutarse en CPU, aunque consumen memoria RAM adicional por cada contexto de navegador.
- Ajuste en GPU de consumo: no aplica.
- Opciones de despliegue: imagen Docker con SDK Docker de HuggingFace Spaces y puerto 7860; también es desplegable en cualquier entorno que ejecute Next.js 16 con Node.js y un volumen persistente para SQLite. Alternativas como contenedores orquestados o VPS son viables, pero no están documentadas por el autor.
- Latencia y throughput: no disponibles. El rendimiento real dependerá de la latencia de los paneles externos scrapeados y del rate limiting de los proveedores, no de cómputo propio.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables, y la categoría correcta no es la de modelos de IA sino la de aplicaciones web de recepción de OTP, para las que tampoco se aportan referencias. No es posible comparar parámetros, contexto, rendimiento ni disponibilidad con alternativas sin datos verificables.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no admite prompts; cualquier expectativa en ese sentido es un error de clasificación del repositorio.
- Credenciales por defecto publicadas: la model card incluye un correo y una contraseña de administrador en texto plano (`fahim563535@gmail.com` / `Adminv123`). Debe cambiarse obligatoriamente antes de cualquier despliegue, junto con `SESSION_SECRET`, cuyo valor por defecto no se documenta.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no exime del cumplimiento de las leyes aplicables ni de los términos de servicio de los proveedores de números y de los servicios cuyas cuentas se verifican.
- Riesgo legal y de términos de servicio: la recepción y reventa de OTP para verificación de cuentas de terceros puede contravenir las condiciones de uso de plataformas como Gmail, así como normativa de telecomunicaciones y de protección de datos (RGPD) si se tratan números personales sin base jurídica.
- Fragilidad de los scrapers: la importación desde paneles Bolt, Core, Sniper y Kazi depende de Playwright y de la estructura HTML de sitios ajenos; cualquier cambio de maquetación o bloqueo anti-bot rompe la funcionalidad sin aviso.
- Persistencia limitada: SQLite en `/data` no está pensado para alta concurrencia ni para despliegues multiinstancia; no se documentan copias de seguridad ni migraciones.
- Ausencia total de datos de calidad: 0 descargas, 0 likes, sin pipeline declarado, sin idiomas declarados y sin documentación de pruebas. La fecha de creación y actualización separadas por 28 segundos sugiere una publicación de una sola pasada, sin mantenimiento posterior.
- Superficie de seguridad no auditada: la model card no describe validación de entradas, gestión de sesiones, cifrado de secretos en reposo ni límites de tasa en la API REST.
- Alucinación y sesgos: no aplica en el sentido de modelos generativos, pero sí existe riesgo de datos incorrectos en las analíticas si los paneles externos devuelven información inconsistente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Parvez113/otp-work-hub-src
- Paper, blog, repositorio de código independiente y demo: no disponibles en la información proporcionada.
- Los resultados de búsqueda web suministrados (Wikipedia en francés e inglés sobre Amiens, amiens.fr, amiens-tourisme.com, franceadventurer.com) no guardan relación con el proyecto y se descartan como fuentes.
